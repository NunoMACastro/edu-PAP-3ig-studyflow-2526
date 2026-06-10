// apps/api/src/modules/material-structure/material-structure.service.ts
/// <reference path="./ambient.d.ts" />
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialIndexService } from "../material-index/material-index.service";
import { CreateMaterialStructureDto } from "../dto/material-structure.dto";
import { MaterialStructure, MaterialStructureDocument } from "../schemas/material-structure.schema";

type IndexedChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

@Injectable()
export class MaterialStructureService {
    constructor(
        @InjectModel(MaterialStructure.name)
        private readonly structures: Model<MaterialStructureDocument>,
        private readonly indexService: MaterialIndexService,
    ) {}

    async create(actor: AuthenticatedUser, jobId: string, dto: CreateMaterialStructureDto) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const chunks = job.extractedTextChunks as IndexedChunk[];
        const topics = dto.manualTopics?.length ? this.cleanManualTopics(dto.manualTopics) : this.extractTopics(chunks);
        const sections = this.buildSections(chunks);
        const structure = await this.structures.findOneAndUpdate(
            { jobId: job._id },
            {
                jobId: job._id,
                materialId: job.materialId,
                ownerId: job.ownerId,
                topics,
                sections,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        return this.toView(structure);
    }

    async get(actor: AuthenticatedUser, jobId: string) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const structure = await this.structures.findOne({ jobId: job._id });
        return structure ? this.toView(structure) : null;
    }

    private cleanManualTopics(topics: string[]) {
        return Array.from(new Set(topics.map((topic) => topic.trim()).filter((topic) => topic.length >= 4))).slice(0, 30);
    }

    private extractTopics(chunks: IndexedChunk[]) {
        const candidates = chunks.flatMap((chunk) => chunk.text.split(/[.;:\n]/));
        return this.cleanManualTopics(candidates).slice(0, 12);
    }

    private buildSections(chunks: IndexedChunk[]) {
        return chunks.slice(0, 20).map((chunk, index) => ({
            order: index + 1,
            title: this.createTitle(chunk.text, index),
            summary: this.summarise(chunk.text),
            references: [
                {
                    chunkOrder: chunk.order,
                    sourceLabel: chunk.sourceLabel,
                    locator: chunk.locator,
                    excerpt: this.excerpt(chunk.text),
                },
            ],
        }));
    }

    private createTitle(text: string, index: number) {
        const [firstSentence] = text.split(/[.!?]/);
        const cleaned = firstSentence.trim();
        return cleaned.length >= 8 ? cleaned.slice(0, 90) : `Secção ${index + 1}`;
    }

    private summarise(text: string) {
        return text.replace(/\s+/g, " ").trim().slice(0, 280);
    }

    private excerpt(text: string) {
        return text.replace(/\s+/g, " ").trim().slice(0, 180);
    }

    private toView(structure: MaterialStructureDocument) {
        return {
            id: structure._id.toString(),
            jobId: structure.jobId.toString(),
            materialId: structure.materialId.toString(),
            topics: structure.topics,
            sections: structure.sections,
        };
    }
}