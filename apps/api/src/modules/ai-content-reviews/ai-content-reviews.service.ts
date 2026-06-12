import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    CreateAiContentReviewDto,
    DecideAiContentReviewDto,
} from "./dto/ai-content-review.dto.js";
import {
    AiContentReview,
    AiContentReviewDocument,
    AiContentReviewStatus,
    AiContentReviewType,
} from "./schemas/ai-content-review.schema.js";

export type AiContentReviewView = {
    _id: string;
    subjectId: string;
    materialId: string;
    teacherId: string;
    contentType: AiContentReviewType;
    contentJson: Record<string, unknown>;
    status: AiContentReviewStatus;
    teacherComment?: string;
    createdAt?: Date;
};

/**
 * Serviço de curadoria docente de conteúdos IA.
 */
@Injectable()
export class AiContentReviewsService {
    constructor(
        @InjectModel(AiContentReview.name)
        private readonly reviewModel: Model<AiContentReviewDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateAiContentReviewDto,
    ): Promise<AiContentReviewView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const material = await this.officialMaterialsService.findOwnedMaterial(
            actor.id,
            input.materialId,
        );
        if (material.subjectId !== subject._id) throw this.notFound();

        const review = await this.reviewModel.create({
            subjectId: new Types.ObjectId(subject._id),
            materialId: new Types.ObjectId(material._id),
            teacherId: new Types.ObjectId(actor.id),
            contentType: input.contentType,
            contentJson: input.contentJson,
            status: "PENDING",
        });
        return this.toView(review.toObject());
    }

    async listForSubject(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<AiContentReviewView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const reviews = await this.reviewModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return reviews.map((review) => this.toView(review));
    }

    async decide(
        actor: AuthenticatedUser,
        reviewId: string,
        input: DecideAiContentReviewDto,
    ): Promise<AiContentReviewView> {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(reviewId)) throw this.notFound();
        const review = await this.reviewModel
            .findOneAndUpdate(
                { _id: reviewId, teacherId: new Types.ObjectId(actor.id) },
                {
                    $set: {
                        status: input.status,
                        teacherComment: input.teacherComment?.trim(),
                    },
                },
                { new: true, runValidators: true },
            )
            .lean();
        if (!review) throw this.notFound();
        return this.toView(review);
    }

    async countApprovedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.reviewModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "APPROVED",
        });
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "AI_CONTENT_REVIEW_NOT_FOUND",
            message: "Revisão de conteúdo não encontrada.",
        });
    }

    private toView(review: {
        _id: unknown;
        subjectId: unknown;
        materialId: unknown;
        teacherId: unknown;
        contentType: AiContentReviewType;
        contentJson: Record<string, unknown>;
        status: AiContentReviewStatus;
        teacherComment?: string;
        createdAt?: Date;
    }): AiContentReviewView {
        return {
            _id: String(review._id),
            subjectId: String(review.subjectId),
            materialId: String(review.materialId),
            teacherId: String(review.teacherId),
            contentType: review.contentType,
            contentJson: review.contentJson,
            status: review.status,
            teacherComment: review.teacherComment,
            createdAt: review.createdAt,
        };
    }
}
