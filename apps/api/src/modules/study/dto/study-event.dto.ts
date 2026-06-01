export type StudyEventType =
    | "ROUTINE_CREATED"
    | "ROUTINE_ARCHIVED"
    | "GOAL_CREATED"
    | "GOAL_UPDATED"
    | "GOAL_ARCHIVED"
    | "STUDY_AREA_CREATED"
    | "MATERIAL_SUBMITTED"
    | "AI_PROFILE_CREATED"
    | "SUMMARY_GENERATED"
    | "STUDY_TOOL_GENERATED";

/**
 * Evento apresentado no histórico de estudo do aluno.
 */
export type StudyEventDto = {
    id: string;
    type: StudyEventType;
    title: string;
    description?: string;
    occurredAt: Date;
};
