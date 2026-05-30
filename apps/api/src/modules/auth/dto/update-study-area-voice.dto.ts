export type VoiceTone =
    | "simple"
    | "rigorous"
    | "step_by_step"
    | "examples_first";
export type VoiceDetailLevel = "short" | "normal" | "detailed";

export class UpdateStudyAreaVoiceDto {
    voiceTone?: VoiceTone;
    voiceDetailLevel?: VoiceDetailLevel;
    voiceNotes?: string;
}