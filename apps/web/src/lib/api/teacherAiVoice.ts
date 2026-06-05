// apps/web/src/lib/api/teacherAiVoice.ts
export type TeacherAiVoiceView = {
    id: string;
    subjectId: string;
    teacherId: string;
    tone: "CALM" | "DIRECT" | "SOCRATIC";
    detailLevel: "SHORT" | "BALANCED" | "DETAILED";
    rules: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function updateTeacherAiVoice(
    subjectId: string,
    input: Pick<TeacherAiVoiceView, "tone" | "detailLevel" | "rules">,
) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<TeacherAiVoiceView>(response);
}

export async function getTeacherAiVoice(subjectId: string) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        credentials: "include",
    });

    return parseResponse<TeacherAiVoiceView>(response);
}