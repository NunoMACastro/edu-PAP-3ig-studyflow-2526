// apps/web/src/lib/api/material-contexts.ts
export type MaterialContextView = { id: string; title: string; scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT"; contextId: string; source: "student" | "teacher" | "class" };
async function requestJson<T>(path: string): Promise<T> {
    const response = await fetch(path, {
        // Envia o cookie HttpOnly da sessão; o backend decide permissões pelo actor autenticado.
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}
export function listPrivateMaterialContexts(studyAreaId: string) {
    return requestJson<MaterialContextView[]>("/api/material-contexts/student/" + studyAreaId);
}
export function listSubjectMaterialContexts(subjectId: string) {
    return requestJson<MaterialContextView[]>("/api/material-contexts/subjects/" + subjectId);
}
export function listTeacherSubjectMaterialContexts(subjectId: string) {
    return requestJson<MaterialContextView[]>("/api/teacher/material-contexts/subjects/" + subjectId);
}