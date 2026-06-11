// apps/web/src/lib/api/class-ai.ts
export type ClassAiAnswerView = { id: string; question: string; answer: string; officialMaterialIds: string[]; teacherVoiceRules: string[] };
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
export function listClassAiAnswers(subjectId: string) {
    return requestJson<ClassAiAnswerView[]>("/api/student/subjects/" + subjectId + "/ai/answers");
}
export function askClassAi(subjectId: string, question: string) {
    return requestJson<ClassAiAnswerView>("/api/student/subjects/" + subjectId + "/ai/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
}