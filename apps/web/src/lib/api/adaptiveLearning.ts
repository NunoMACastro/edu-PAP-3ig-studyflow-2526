// apps/web/src/lib/api/adaptiveLearning.ts
export type LearningProfileView = {
    id: string;
    studyAreaId: string;
    pace: "SLOW" | "BALANCED" | "FAST";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    difficulties: string[];
    preferredExplanationStyle: string;
};

export type AdaptiveExplanationView = {
    id: string;
    topic: string;
    answer: string;
    sources: Array<{ materialId: string; title: string }>;
    adaptationNotes: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function getLearningProfile(studyAreaId: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/learning-profile`, {
        credentials: "include",
    });

    return parseResponse<LearningProfileView>(response);
}

export async function updateLearningProfile(
    studyAreaId: string,
    input: Omit<LearningProfileView, "id" | "studyAreaId">,
) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/learning-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<LearningProfileView>(response);
}

export async function askAdaptiveExplanation(studyAreaId: string, topic: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/adaptive-explanations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
    });

    return parseResponse<AdaptiveExplanationView>(response);
}