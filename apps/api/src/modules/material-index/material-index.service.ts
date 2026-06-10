// apps/api/src/modules/material-index/material-index.service.ts
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import mammoth from "mammoth";
import { Model, Types } from "mongoose";
import pdfParse from "pdf-parse";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialsService } from "../materials/materials.service";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import {
    MaterialIndexJob,
    MaterialIndexJobDocument,
    MaterialIndexScope,
    MaterialTextChunk,
} from "./schemas/material-index-job.schema";

type IndexableMaterial = {
    _id: Types.ObjectId;
    title?: string;
    type?: "PDF" | "DOCX" | "URL" | "TOPIC" | "TEXT";
    mimeType?: string;
    storageKey?: string;
    sourceUrl?: string;
    contentText?: string;
    textContent?: string;
    studyAreaId?: Types.ObjectId;
};

@Injectable()
export class MaterialIndexService {
    private readonly storageRoot =
        process.env.MATERIALS_STORAGE_DIR ?? "storage/materials";

    constructor(
        @InjectModel(MaterialIndexJob.name)
        private readonly jobs: Model<MaterialIndexJobDocument>,
        private readonly materialsService: MaterialsService,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async startPrivateIndex(actor: AuthenticatedUser, studyAreaId: string, materialId: string) {
        this.assertStudent(actor);
        const materials = await this.materialsService.listByArea(actor.id, studyAreaId);
        const material = materials.find((item) => item._id.toString() === materialId) as
            | IndexableMaterial
            | undefined;

        if (!material || !material.studyAreaId) {
            throw new NotFoundException("Material privado não encontrado nesta área.");
        }

        return this.queueJob(
            actor.id,
            material._id,
            material.studyAreaId,
            "PRIVATE_AREA",
            material,
        );
    }

    async startOfficialIndex(actor: AuthenticatedUser, subjectId: string, materialId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        const material = materials.find((item) => item._id.toString() === materialId) as
            | IndexableMaterial
            | undefined;

        if (!material) {
            throw new NotFoundException("Material oficial processado não encontrado nesta disciplina.");
        }

        return this.queueJob(
            actor.id,
            material._id,
            subject._id,
            "OFFICIAL_SUBJECT",
            material,
        );
    }

    async getJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.findOwnedJob(actor, jobId);
        return this.toView(job);
    }

    async findDoneJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.findOwnedJob(actor, jobId);
        if (job.status !== "DONE" || job.extractedTextChunks.length === 0) {
            throw new UnprocessableEntityException("A indexação ainda não terminou.");
        }

        return job;
    }

    private async queueJob(
        ownerId: string,
        materialId: Types.ObjectId,
        contextId: Types.ObjectId,
        scope: MaterialIndexScope,
        material: IndexableMaterial,
    ) {
        const job = await this.jobs.create({
            ownerId: new Types.ObjectId(ownerId),
            materialId,
            contextId,
            scope,
            status: "PROCESSING",
            extractedTextChunks: [],
        });

        try {
            const chunks = await this.extractMaterialChunks(material);

            if (chunks.length === 0) {
                throw new UnprocessableEntityException("Material sem texto processável.");
            }

            await this.jobs.updateOne(
                { _id: job._id },
                { status: "DONE", extractedTextChunks: chunks, errorMessage: undefined },
            );

            const doneJob = await this.jobs.findById(job._id);
            return this.toView(doneJob ?? job);
        } catch (error) {
            await this.jobs.updateOne(
                { _id: job._id },
                {
                    status: "FAILED",
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : "Falha desconhecida na indexação.",
                },
            );

            throw new UnprocessableEntityException(
                "Não foi possível extrair texto processável deste material.",
            );
        }
    }

    private async findOwnedJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.jobs.findOne({ _id: jobId, ownerId: new Types.ObjectId(actor.id) });

        if (!job) {
            throw new NotFoundException("Job de indexação não encontrado para este utilizador.");
        }

        return job;
    }

    private async extractMaterialChunks(material: IndexableMaterial) {
        const directText = material.contentText ?? material.textContent;

        if (directText?.trim()) {
            return this.toChunks(directText, material.title ?? "Texto fornecido", "texto");
        }

        if (material.sourceUrl) {
            const text = await this.extractTextFromUrl(material.sourceUrl);
            return this.toChunks(text, material.title ?? material.sourceUrl, material.sourceUrl);
        }

        if (material.storageKey && this.isPdf(material)) {
            const fileBuffer = await readFile(join(this.storageRoot, material.storageKey));
            const parsed = await pdfParse(fileBuffer);
            return this.toChunks(parsed.text, material.title ?? material.storageKey, "pdf");
        }

        if (material.storageKey && this.isDocx(material)) {
            const fileBuffer = await readFile(join(this.storageRoot, material.storageKey));
            const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
            return this.toChunks(parsed.value, material.title ?? material.storageKey, "docx");
        }

        throw new UnprocessableEntityException(
            "Material sem texto direto, URL ou ficheiro suportado para indexação.",
        );
    }

    private async extractTextFromUrl(sourceUrl: string) {
        const url = new URL(sourceUrl);
        const response = await this.fetchPublicUrl(url);

        if (!response.ok) {
            throw new UnprocessableEntityException("Não foi possível ler o URL indicado.");
        }

        const html = await response.text();
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    private async fetchPublicUrl(initialUrl: URL) {
        let currentUrl = initialUrl;

        for (let redirects = 0; redirects <= 5; redirects += 1) {
            await this.assertPublicHttpUrl(currentUrl);

            const response = await fetch(currentUrl.toString(), { redirect: "manual" });

            if (![301, 302, 303, 307, 308].includes(response.status)) {
                return response;
            }

            const location = response.headers.get("location");
            if (!location) {
                throw new UnprocessableEntityException("Redirect sem destino válido.");
            }

            currentUrl = new URL(location, currentUrl);
        }

        throw new UnprocessableEntityException("URL com demasiados redirects.");
    }

    private async assertPublicHttpUrl(url: URL) {
        if (!["http:", "https:"].includes(url.protocol)) {
            throw new UnprocessableEntityException("Apenas URLs HTTP ou HTTPS podem ser indexados.");
        }

        const hostname = url.hostname.replace(/^\[|\]$/g, "");

        if (this.isPrivateHostname(hostname)) {
            throw new UnprocessableEntityException("URLs internas ou locais não podem ser indexadas.");
        }

        const addresses = await lookup(hostname, { all: true });

        if (addresses.some((entry) => this.isPrivateAddress(entry.address))) {
            throw new UnprocessableEntityException("URLs resolvidas para redes privadas não podem ser indexadas.");
        }
    }

    private toChunks(text: string, sourceLabel: string, locator: string): MaterialTextChunk[] {
        return text
            .split(/\n{2,}|(?<=\.)\s+/)
            .map((part) => part.trim())
            .filter((part) => part.length >= 20)
            .slice(0, 80)
            .map((part, index) => ({
                order: index + 1,
                text: part,
                sourceLabel,
                locator,
            }));
    }

    private isPdf(material: IndexableMaterial) {
        return material.type === "PDF" || material.mimeType === "application/pdf";
    }

    private isDocx(material: IndexableMaterial) {
        return (
            material.type === "DOCX" ||
            material.mimeType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
    }

    private isPrivateHostname(hostname: string) {
        const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

        return (
            normalized === "localhost" ||
            normalized.endsWith(".local") ||
            this.isPrivateAddress(normalized)
        );
    }

    private isPrivateAddress(address: string) {
        const normalized = address.toLowerCase();
        const ipv4 = normalized.startsWith("::ffff:")
            ? normalized.slice("::ffff:".length)
            : normalized;

        if (
            normalized === "::1" ||
            normalized === "::" ||
            normalized.startsWith("fc") ||
            normalized.startsWith("fd") ||
            normalized.startsWith("fe80:")
        ) {
            return true;
        }

        const octets = ipv4.split(".").map((value) => Number(value));
        if (octets.length !== 4 || octets.some((value) => Number.isNaN(value))) {
            return false;
        }

        const [first, second] = octets;
        return (
            first === 0 ||
            first === 10 ||
            first === 127 ||
            (first === 169 && second === 254) ||
            (first === 172 && second >= 16 && second <= 31) ||
            (first === 192 && second === 168)
        );
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem indexar materiais privados.");
        }
    }
    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem indexar materiais oficiais.");
        }
    }
    private toView(job: MaterialIndexJob) {
        return {
            id: job._id.toString(),
            materialId: job.materialId.toString(),
            contextId: job.contextId.toString(),
            scope: job.scope,
            status: job.status,
            extractedTextChunks: job.extractedTextChunks,
            errorMessage: job.errorMessage ?? null,
        };
    }
}