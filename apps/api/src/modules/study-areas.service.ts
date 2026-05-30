import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateStudyAreaDto } from "./dto/create-study-area.dto";
import { UpdateStudyAreaDto } from "./dto/update-study-area.dto";
import { StudyArea, StudyAreaDocument } from "./schemas/study-area.schema";

@Injectable()
export class StudyAreasService {
    constructor(
        @InjectModel(StudyArea.name)
        private readonly areaModel: Model<StudyAreaDocument>,
    ) {}

    async listMyStudyAreas(userId: string) {
        return this.areaModel
            .find({ userId: new Types.ObjectId(userId), archived: false })
            .sort({ name: 1 })
            .lean();
    }

    async getMyStudyArea(userId: string, areaId: string) {
        if (!Types.ObjectId.isValid(areaId)) {
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
        }
        return this.areaModel
            .findOne({
                _id: areaId,
                userId: new Types.ObjectId(userId),
                archived: false,
            })
            .lean();
    }

    async createStudyArea(userId: string, input: CreateStudyAreaDto) {
        const name = input.name?.trim();
        if (!name)
            throw new BadRequestException({
                code: "AREA_NAME_REQUIRED",
                message: "Indica o nome da área.",
            });

        const duplicate = await this.areaModel.exists({
            userId: new Types.ObjectId(userId),
            name,
        });
        if (duplicate)
            throw new ConflictException({
                code: "AREA_NAME_DUPLICATED",
                message: "Já tens uma área com esse nome.",
            });

        return this.areaModel.create({
            userId: new Types.ObjectId(userId),
            name,
            description: input.description?.trim(),
            color: input.color?.trim(),
        });
    }

    async updateStudyArea(
        userId: string,
        areaId: string,
        input: UpdateStudyAreaDto,
    ) {
        const updated = await this.areaModel
            .findOneAndUpdate(
                { _id: areaId, userId: new Types.ObjectId(userId) },
                {
                    $set: {
                        ...input,
                        name: input.name?.trim(),
                        description: input.description?.trim(),
                    },
                },
                { new: true, runValidators: true },
            )
            .lean();
        if (!updated)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
        return updated;
    }
}