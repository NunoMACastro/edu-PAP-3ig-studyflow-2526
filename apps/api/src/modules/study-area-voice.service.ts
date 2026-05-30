import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { UpdateStudyAreaVoiceDto } from "./dto/update-study-area-voice.dto";
import { StudyAreasService } from "./study-areas.service";

const TONES = ["simple", "rigorous", "step_by_step", "examples_first"];
const DETAIL_LEVELS = ["short", "normal", "detailed"];

@Injectable()
export class StudyAreaVoiceService {
    constructor(private readonly studyAreasService: StudyAreasService) {}

    async updateVoice(
        userId: string,
        areaId: string,
        input: UpdateStudyAreaVoiceDto,
    ) {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            areaId,
        );
        if (!area)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área não encontrada.",
            });

        if (input.voiceTone && !TONES.includes(input.voiceTone)) {
            throw new BadRequestException({
                code: "INVALID_VOICE_TONE",
                message: "Tom inválido.",
            });
        }
        if (
            input.voiceDetailLevel &&
            !DETAIL_LEVELS.includes(input.voiceDetailLevel)
        ) {
            throw new BadRequestException({
                code: "INVALID_DETAIL_LEVEL",
                message: "Nível de detalhe inválido.",
            });
        }

        return this.studyAreasService.updateVoiceFields(
            userId,
            new Types.ObjectId(area._id).toString(),
            {
                voiceTone: input.voiceTone,
                voiceDetailLevel: input.voiceDetailLevel ?? "normal",
                voiceNotes: this.sanitizeNotes(input.voiceNotes),
            },
        );
    }

    private sanitizeNotes(notes: string | undefined): string | undefined {
        if (!notes) return undefined;
        return notes.replace(/[<>]/g, "").trim().slice(0, 500);
    }
}