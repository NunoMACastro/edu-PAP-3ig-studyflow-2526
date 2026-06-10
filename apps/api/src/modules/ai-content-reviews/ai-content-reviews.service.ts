// apps/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateAiContentReviewDto, DecideAiContentReviewDto } from "./dto/ai-content-review.dto.js";
import { AiContentReview, AiContentReviewDocument } from "./schemas/ai-content-review.schema.js";

@Injectable()
export class AiContentReviewsService {
    constructor(
        @InjectModel(AiContentReview.name)
        private readonly reviews: Model<AiContentReviewDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateAiContentReviewDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const materials = await this.officialMaterialsService.listProcessedForSubject(subject._id);
        const material = materials.find((item: any) => item._id.toString() === dto.materialId);
        if (!material) {
            throw new NotFoundException("Material oficial processado não encontrado nesta disciplina.");
        }
        const review = await this.reviews.create({ subjectId: subject._id, materialId: material._id, teacherId: new Types.ObjectId(actor.id), kind: dto.kind, generatedContent: dto.generatedContent.trim(), status: "PENDING" });
        return this.toView(review);
    }

    async list(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const reviews = await this.reviews.find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return reviews.map((review) => this.toView(review));
    }

    async decide(actor: AuthenticatedUser, subjectId: string, reviewId: string, dto: DecideAiContentReviewDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const review = await this.reviews.findOneAndUpdate({ _id: reviewId, subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) }, { status: dto.status, rejectionReason: dto.rejectionReason?.trim() }, { new: true });
        if (!review) {
            throw new NotFoundException("Revisão não encontrada nesta disciplina.");
        }
        return this.toView(review);
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem rever conteúdo IA.");
        }
    }
    private toView(review: AiContentReview) {
        return { id: review._id.toString(), kind: review.kind, status: review.status, generatedContent: review.generatedContent, rejectionReason: review.rejectionReason ?? null };
    }
}