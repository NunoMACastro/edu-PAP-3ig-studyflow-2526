// apps/api/src/modules/material-contexts/schemas/material-context.schema.ts
export type MaterialContextScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";

export type MaterialContextView = {
    id: string;
    title: string;
    scope: MaterialContextScope;
    contextId: string;
    source: "student" | "teacher" | "class";
};