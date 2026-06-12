import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import mammoth from "mammoth";
import { Model, Types } from "mongoose";
import { isIP } from "net";
import { PDFParse } from "pdf-parse";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    MaterialIndexJob,
    MaterialIndexJobDocument,
    MaterialIndexScope,
    MaterialIndexStatus,
    MaterialTextChunk,
} from "./schemas/material-index-job.schema.js";

export type MaterialIndexJobView = {
    _id: string;
    scope: MaterialIndexScope;
    materialId: string;
    studyAreaId?: string;
    subjectId?: string;
    userId?: string;
    teacherId?: string;
    status: MaterialIndexStatus;
    extractedTextChunks: MaterialTextChunk[];
    errorMessage?: string;
    createdAt?: Date;
};

type IndexablePrivateMaterial = {
    _id: unknown;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    title: string;
    url?: string;
    storageKey?: string;
    contentText?: string;
};

type IndexableOfficialMaterial = {
    _id: string;
    subjectId: string;
    type: "TEXT" | "URL";
    title: string;
    sourceUrl?: string;
    textContent?: string;
};

const MAX_URL_TEXT_BYTES = 250_000;
const MAX_URL_REDIRECTS = 3;
const URL_FETCH_TIMEOUT_MS = 5_000;

type PublicResolvedHost = {
    hostname: string;
    address: string;
    family: 4 | 6;
};

type PinnedTextResponse = {
    status: number;
    headers: http.IncomingHttpHeaders;
    body: string;
    remoteAddress?: string;
};

export const materialIndexUrlSafety = {
    resolveHost(host: string) {
        return dns.lookup(host, { all: true, verbatim: true });
    },
    requestText(url: string, resolvedHost: PublicResolvedHost) {
        return requestPinnedText(url, resolvedHost);
    },
};

function requestPinnedText(
    value: string,
    resolvedHost: PublicResolvedHost,
): Promise<PinnedTextResponse> {
    return new Promise((resolve, reject) => {
        const url = new URL(value);
        const client = url.protocol === "https:" ? https : http;
        const request = client.request(
            url,
            {
                method: "GET",
                headers: {
                    Accept: "text/plain,text/html,application/json;q=0.8",
                    Host: url.host,
                },
                servername: url.hostname,
                timeout: URL_FETCH_TIMEOUT_MS,
                lookup: (_hostname, _options, callback) => {
                    callback(null, resolvedHost.address, resolvedHost.family);
                },
            },
            (response) => {
                const chunks: Buffer[] = [];
                let byteLength = 0;
                response.on("data", (chunk: Buffer | string) => {
                    const buffer = Buffer.isBuffer(chunk)
                        ? chunk
                        : Buffer.from(chunk);
                    byteLength += buffer.byteLength;
                    if (byteLength > MAX_URL_TEXT_BYTES) {
                        request.destroy(
                            new Error("URL excede o tamanho máximo permitido para indexação."),
                        );
                        return;
                    }
                    chunks.push(buffer);
                });
                response.on("end", () => {
                    resolve({
                        status: response.statusCode ?? 0,
                        headers: response.headers,
                        body: Buffer.concat(chunks).toString("utf8"),
                        remoteAddress: response.socket.remoteAddress,
                    });
                });
            },
        );

        request.on("timeout", () => {
            request.destroy(new Error("Tempo esgotado ao obter texto do material."));
        });
        request.on("error", reject);
        request.end();
    });
}

/**
 * Serviço de indexação textual básica de materiais.
 */
@Injectable()
export class MaterialIndexService {
    constructor(
        @InjectModel(MaterialIndexJob.name)
        private readonly jobModel: Model<MaterialIndexJobDocument>,
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async indexPrivateMaterial(
        actor: AuthenticatedUser,
        studyAreaId: string,
        materialId: string,
    ): Promise<MaterialIndexJobView> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        const material = (await this.materialsService.findOwnedTextMaterial(
            actor.id,
            studyAreaId,
            materialId,
        )) as IndexablePrivateMaterial;
        const extraction = await this.extractPrivateMaterial(actor.id, material);
        if (extraction.text) {
            await this.materialsService.markIndexedText(
                actor.id,
                materialId,
                extraction.text,
            );
        }
        return this.createJob({
            scope: "PRIVATE_AREA",
            materialId,
            studyAreaId,
            userId: actor.id,
            chunks: this.createChunks(extraction.text, material.title),
            errorMessage: extraction.errorMessage,
        });
    }

    async indexOfficialMaterial(
        actor: AuthenticatedUser,
        materialId: string,
    ): Promise<MaterialIndexJobView> {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
        const material = await this.officialMaterialsService.findOwnedMaterial(
            actor.id,
            materialId,
        ) as IndexableOfficialMaterial;
        const extraction = await this.extractOfficialMaterial(material);
        if (extraction.text) {
            await this.officialMaterialsService.markIndexedText(
                actor.id,
                materialId,
                extraction.text,
            );
        }
        return this.createJob({
            scope: "OFFICIAL_SUBJECT",
            materialId,
            subjectId: material.subjectId,
            teacherId: actor.id,
            chunks: this.createChunks(extraction.text, material.title),
            errorMessage: extraction.errorMessage,
        });
    }

    async findDoneJob(
        actor: AuthenticatedUser,
        jobId: string,
    ): Promise<MaterialIndexJobView> {
        if (!Types.ObjectId.isValid(jobId)) throw this.notFound();
        const job = await this.jobModel.findById(jobId).lean();
        if (!job) throw this.notFound();
        const view = this.toView(job);

        if (
            (view.scope === "PRIVATE_AREA" && view.userId !== actor.id) ||
            (view.scope === "OFFICIAL_SUBJECT" && view.teacherId !== actor.id)
        ) {
            throw new ForbiddenException({
                code: "MATERIAL_INDEX_ACCESS_DENIED",
                message: "Não tens acesso a este job de indexação.",
            });
        }
        if (view.status !== "DONE") {
            throw new UnprocessableEntityException({
                code: "MATERIAL_INDEX_NOT_DONE",
                message: "O material ainda não tem indexação concluída.",
            });
        }
        return view;
    }

    private async createJob(input: {
        scope: MaterialIndexScope;
        materialId: string;
        studyAreaId?: string;
        subjectId?: string;
        userId?: string;
        teacherId?: string;
        chunks: MaterialTextChunk[];
        errorMessage?: string;
    }): Promise<MaterialIndexJobView> {
        const base = {
            scope: input.scope,
            materialId: new Types.ObjectId(input.materialId),
            studyAreaId: input.studyAreaId
                ? new Types.ObjectId(input.studyAreaId)
                : undefined,
            subjectId: input.subjectId
                ? new Types.ObjectId(input.subjectId)
                : undefined,
            userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
            teacherId: input.teacherId ? new Types.ObjectId(input.teacherId) : undefined,
        };
        const job = await this.jobModel.create(
            input.chunks.length === 0
                ? {
                      ...base,
                      status: "FAILED",
                      errorMessage:
                          input.errorMessage ??
                          "O material ainda não tem texto processável disponível.",
                  }
                : { ...base, status: "DONE", extractedTextChunks: input.chunks },
        );
        return this.toView(job.toObject());
    }

    private async extractPrivateMaterial(
        userId: string,
        material: IndexablePrivateMaterial,
    ): Promise<{ text?: string; errorMessage?: string }> {
        try {
            if (material.type === "TOPIC") {
                return { text: material.contentText };
            }
            if (material.type === "URL") {
                return { text: await this.fetchTextFromUrl(material.url) };
            }
            if (!material.storageKey) {
                return { errorMessage: "O ficheiro do material não está disponível." };
            }
            const buffer = await this.materialsService.readStoredFile(
                material.storageKey,
            );
            if (material.type === "PDF") {
                return { text: await this.extractPdfText(buffer) };
            }
            if (material.type === "DOCX") {
                return { text: await this.extractDocxText(buffer) };
            }
            return { errorMessage: "Tipo de material privado não suportado." };
        } catch (error) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    private async extractOfficialMaterial(
        material: IndexableOfficialMaterial,
    ): Promise<{ text?: string; errorMessage?: string }> {
        try {
            if (material.type === "TEXT") {
                return { text: material.textContent };
            }
            if (material.type === "URL") {
                return { text: await this.fetchTextFromUrl(material.sourceUrl) };
            }
            return { errorMessage: "Tipo de material oficial não suportado." };
        } catch (error) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    private async extractPdfText(buffer: Buffer): Promise<string> {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        try {
            const result = await parser.getText();
            return result.text.trim();
        } finally {
            await parser.destroy();
        }
    }

    private async extractDocxText(buffer: Buffer): Promise<string> {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
    }

    private async fetchTextFromUrl(value: string | undefined): Promise<string> {
        let url = this.parseSafeHttpUrl(value);
        let response: PinnedTextResponse | undefined;
        for (let redirectCount = 0; redirectCount <= MAX_URL_REDIRECTS; redirectCount += 1) {
            const resolvedHost = await this.resolvePublicHost(url);
            response = await materialIndexUrlSafety.requestText(url, resolvedHost);
            if (
                response.remoteAddress &&
                this.isPrivateIp(response.remoteAddress)
            ) {
                throw new Error("URL ligou a rede local ou privada.");
            }
            if (!this.isRedirect(response.status)) break;

            const location = this.getHeaderValue(response.headers.location);
            if (!location) {
                throw new Error("Redirect sem destino válido.");
            }
            if (redirectCount === MAX_URL_REDIRECTS) {
                throw new Error("URL excede o limite de redirects permitido.");
            }
            url = this.parseSafeHttpUrl(new URL(location, url).toString());
        }
        if (!response) {
            throw new Error("Não foi possível obter a URL.");
        }
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`URL devolveu HTTP ${response.status}`);
        }
        const contentLength = Number(
            this.getHeaderValue(response.headers["content-length"]) ?? 0,
        );
        if (contentLength > MAX_URL_TEXT_BYTES) {
            throw new Error("URL excede o tamanho máximo permitido para indexação.");
        }
        const contentType =
            this.getHeaderValue(response.headers["content-type"]) ?? "";
        if (
            contentType &&
            !/(text\/|application\/json|application\/xml|application\/xhtml\+xml)/i.test(
                contentType,
            )
        ) {
            throw new Error("URL não devolveu conteúdo textual indexável.");
        }
        if (Buffer.byteLength(response.body, "utf8") > MAX_URL_TEXT_BYTES) {
            throw new Error("URL excede o tamanho máximo permitido para indexação.");
        }
        return this.stripHtml(response.body).trim();
    }

    private isRedirect(status: number): boolean {
        return [301, 302, 303, 307, 308].includes(status);
    }

    private parseSafeHttpUrl(value: string | undefined): string {
        const url = new URL(String(value ?? ""));
        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("URL deve usar http ou https.");
        }
        const host = url.hostname.toLowerCase();
        if (
            host === "localhost" ||
            host.endsWith(".localhost") ||
            this.isPrivateIp(host)
        ) {
            throw new Error("URL local ou privada não pode ser indexada.");
        }
        return url.toString();
    }

    private async resolvePublicHost(value: string): Promise<PublicResolvedHost> {
        const { hostname } = new URL(value);
        const host = hostname.toLowerCase();
        if (this.isPrivateIp(host)) {
            throw new Error("URL local ou privada não pode ser indexada.");
        }
        const ipFamily = isIP(host);
        if (ipFamily !== 0) {
            return { hostname: host, address: host, family: ipFamily === 6 ? 6 : 4 };
        }

        const addresses = await materialIndexUrlSafety.resolveHost(host);
        if (addresses.length === 0) {
            throw new Error("URL não resolveu para nenhum endereço.");
        }
        if (addresses.some((address) => this.isPrivateIp(address.address))) {
            throw new Error("URL resolve para rede local ou privada.");
        }
        const [firstAddress] = addresses;
        return {
            hostname: host,
            address: firstAddress.address,
            family: firstAddress.family === 6 ? 6 : 4,
        };
    }

    private isPrivateIp(host: string): boolean {
        if (isIP(host) === 0) return false;
        if (host === "::1" || host === "0.0.0.0") return true;
        if (host.startsWith("127.") || host.startsWith("10.")) return true;
        if (host.startsWith("192.168.")) return true;
        if (host.startsWith("169.254.") || host === "169.254.169.254") return true;
        if (host.startsWith("100.64.")) return true;
        const parts = host.split(".").map(Number);
        if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
            return true;
        }
        return host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
    }

    private stripHtml(text: string): string {
        return text
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ");
    }

    private getHeaderValue(header: string | string[] | undefined): string | undefined {
        return Array.isArray(header) ? header[0] : header;
    }

    private toExtractionError(error: unknown): string {
        if (error instanceof Error && error.message) {
            return error.message.slice(0, 1000);
        }
        return "Não foi possível extrair texto do material.";
    }

    private createChunks(
        text: string | undefined,
        sourceLabel: string,
    ): MaterialTextChunk[] {
        const cleanText = text?.trim();
        if (!cleanText) return [];
        const paragraphs = cleanText
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
        const parts = paragraphs.length > 0 ? paragraphs : [cleanText];
        return parts.slice(0, 40).map((part, index) => ({
            order: index + 1,
            text: part.slice(0, 2000),
            sourceLabel,
            locator: `chunk-${index + 1}`,
        }));
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_INDEX_JOB_NOT_FOUND",
            message: "Job de indexação não encontrado.",
        });
    }

    private toView(job: {
        _id: unknown;
        scope: MaterialIndexScope;
        materialId: unknown;
        studyAreaId?: unknown;
        subjectId?: unknown;
        userId?: unknown;
        teacherId?: unknown;
        status: MaterialIndexStatus;
        extractedTextChunks?: MaterialTextChunk[];
        errorMessage?: string;
        createdAt?: Date;
    }): MaterialIndexJobView {
        return {
            _id: String(job._id),
            scope: job.scope,
            materialId: String(job.materialId),
            studyAreaId: job.studyAreaId ? String(job.studyAreaId) : undefined,
            subjectId: job.subjectId ? String(job.subjectId) : undefined,
            userId: job.userId ? String(job.userId) : undefined,
            teacherId: job.teacherId ? String(job.teacherId) : undefined,
            status: job.status,
            extractedTextChunks: job.extractedTextChunks ?? [],
            errorMessage: job.errorMessage,
            createdAt: job.createdAt,
        };
    }
}
