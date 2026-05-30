export async function updateStudyAreaVoice(
    studyAreaId: string,
    payload: {
        voiceTone: "simple" | "rigorous" | "step_by_step" | "examples_first";
        voiceDetailLevel: "short" | "normal" | "detailed";
        voiceNotes?: string;
    },
) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/voice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(
            data?.message ?? "Não foi possível guardar a voz da IA.",
        );
    return data;
}