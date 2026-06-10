// apps/web/src/lib/api/class-progress.ts
export type ClassProgressDashboard = { classId: string; noteCount: number; postCount: number; difficultyTags: string[]; notes: { id: string; title: string; note: string; difficultyTags: string[] }[] };
export type CreateClassProgressNoteInput = { title: string; note: string; difficultyTags?: string[] };
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        ...init,
        // Envia o cookie HttpOnly da sessão; o frontend nunca guarda tokens manualmente.
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}
export function getClassProgressDashboard(classId: string) {
    return requestJson<ClassProgressDashboard>("/api/teacher/classes/" + classId + "/progress-dashboard");
}
export function createClassProgressNote(classId: string, input: CreateClassProgressNoteInput) {
    return requestJson<ClassProgressDashboard["notes"][number]>("/api/teacher/classes/" + classId + "/progress-dashboard/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}