// apps/web/src/lib/api/classAi.ts
export type ClassAiAnswer = {
    id: string;
    answer: string;
    sources: Array<{ materialId: string; title: string }>;
};

export async function askClassAi(subjectId: string, question: string) {
    const response = await fetch(`/api/student/subjects/${subjectId}/ai/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<ClassAiAnswer>;
}