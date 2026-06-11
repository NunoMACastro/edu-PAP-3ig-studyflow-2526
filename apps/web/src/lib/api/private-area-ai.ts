// apps/web/src/lib/api/private-area-ai.ts
export type PrivateAreaAiAnswerView = { id: string; question: string; answer: string; sourceMaterialIds: string[] };
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
export function listPrivateAreaAiAnswers(studyAreaId: string) {
    return requestJson<PrivateAreaAiAnswerView[]>("/api/study-areas/" + studyAreaId + "/private-ai/answers");
}
export function askPrivateAreaAi(studyAreaId: string, question: string) {
    return requestJson<PrivateAreaAiAnswerView>("/api/study-areas/" + studyAreaId + "/private-ai/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
}