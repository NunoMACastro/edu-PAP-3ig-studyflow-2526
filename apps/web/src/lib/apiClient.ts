export type Material = {
    _id: string;
    title: string;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    status: "PENDING_PROCESSING" | "READY" | "FAILED";
    url?: string;
};

export async function listMaterials(studyAreaId: string): Promise<Material[]> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/materials`, {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Não foi possível carregar materiais.");
    return (await response.json()) as Material[];
}

export async function submitTopicMaterial(
    studyAreaId: string,
    payload: { title: string; topicText: string },
): Promise<Material> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "TOPIC", ...payload }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível submeter material.");
    return data as Material;
}

export async function submitUrlMaterial(
    studyAreaId: string,
    payload: { title: string; url: string },
): Promise<Material> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "URL", ...payload }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível submeter URL.");
    return data as Material;
}

export async function submitFileMaterial(
    studyAreaId: string,
    payload: { title: string; file: File },
): Promise<Material> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("file", payload.file);

    const response = await fetch(
        `/api/study-areas/${studyAreaId}/materials/file`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível submeter ficheiro.");
    return data as Material;
}

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


export type AiAreaProfile = {
    id: string;
    studyAreaId: string;
    status: "MISSING_MATERIALS" | "PENDING_PROCESSING" | "READY_FOR_GENERATION";
    sourceCount: number;
    processableSourceCount: number;
    voiceTone?: string;
};

export async function prepareAiAreaProfile(
    studyAreaId: string,
): Promise<AiAreaProfile> {
    const response = await fetch(`/api/study-areas/${studyAreaId}/ai-profile`, {
        method: "POST",
        credentials: "include",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(
            data?.message ?? "Não foi possível preparar o perfil IA.",
        );
    return data as AiAreaProfile;
}

export async function generateSummary(studyAreaId: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/summaries`, {
        method: "POST",
        credentials: "include",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível gerar resumo.");
    return data;
}

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export type AiArtifact = {
    _id: string;
    type: "SUMMARY" | StudyToolType;
    contentJson: Record<string, unknown>;
    sourcesJson: Array<{ materialId: string; title: string }>;
};

export async function listStudyTools(
    studyAreaId: string,
    type?: StudyToolType,
): Promise<AiArtifact[]> {
    const suffix = type ? `?type=${type}` : "";
    const response = await fetch(
        `/api/study-areas/${studyAreaId}/study-tools${suffix}`,
        { credentials: "include" },
    );
    if (!response.ok)
        throw new Error("Não foi possível carregar ferramentas de estudo.");
    return (await response.json()) as AiArtifact[];
}

export async function generateStudyTool(
    studyAreaId: string,
    payload: { type: StudyToolType; topic?: string },
): Promise<AiArtifact> {
    const response = await fetch(
        `/api/study-areas/${studyAreaId}/study-tools`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(
            data?.message ?? "Não foi possível gerar ferramenta de estudo.",
        );
    return data as AiArtifact;
}