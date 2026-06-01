import { AiAreaProfileStatus } from "../schemas/ai-area-profile.schema.js";

/**
 * Resposta pública do perfil IA de uma área.
 */
export type AiAreaProfileDto = {
    id: string;
    studyAreaId: string;
    status: AiAreaProfileStatus;
    sourceCount: number;
    processableSourceCount: number;
    voiceTone?: string;
};
