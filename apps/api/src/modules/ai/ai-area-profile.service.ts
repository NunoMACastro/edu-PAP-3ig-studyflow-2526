import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AiAreaProfileDto } from "./dto/ai-area-profile.dto";
import {
    AiAreaProfile,
    AiAreaProfileDocument,
    AiAreaProfileStatus,
} from "./schemas/ai-area-profile.schema";

@Injectable()
export class AiAreaProfileService {
    constructor(
        @InjectModel(AiAreaProfile.name)
        private readonly profileModel: Model<AiAreaProfileDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
    ) {}

    async prepareProfile(
        userId: string,
        studyAreaId: string,
    ): Promise<AiAreaProfileDto> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área não encontrada.",
            });

        const materials = await this.materialsService.listByArea(
            userId,
            studyAreaId,
        );
        const processable = materials.filter(
            (material) => material.status === "READY",
        );
        const status = this.calculateStatus(
            materials.length,
            processable.length,
        );

        const profile = await this.profileModel.findOneAndUpdate(
            {
                studyAreaId: new Types.ObjectId(studyAreaId),
                userId: new Types.ObjectId(userId),
            },
            {
                $set: {
                    status,
                    sourceCount: materials.length,
                    processableSourceCount: processable.length,
                    materialIds: materials.map((material) => material._id),
                    voiceTone: area.voiceTone,
                },
            },
            { new: true, upsert: true, runValidators: true },
        );

        return this.toDto(profile);
    }

    private calculateStatus(
        sourceCount: number,
        processableCount: number,
    ): AiAreaProfileStatus {
        if (sourceCount === 0) return "MISSING_MATERIALS";
        if (processableCount === 0) return "PENDING_PROCESSING";
        return "READY_FOR_GENERATION";
    }

    private toDto(profile: AiAreaProfileDocument): AiAreaProfileDto {
        return {
            id: profile._id.toString(),
            studyAreaId: profile.studyAreaId.toString(),
            status: profile.status,
            sourceCount: profile.sourceCount,
            processableSourceCount: profile.processableSourceCount,
            voiceTone: profile.voiceTone,
        };
    }
}