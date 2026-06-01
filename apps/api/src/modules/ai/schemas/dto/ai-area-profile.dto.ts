import { AiAreaProfileStatus } from "../schemas/ai-area-profile.schema";

export type AiAreaProfileDto = {
    id: string;
    studyAreaId: string;
    status: AiAreaProfileStatus;
    sourceCount: number;
    processableSourceCount: number;
    voiceTone?: string;
};