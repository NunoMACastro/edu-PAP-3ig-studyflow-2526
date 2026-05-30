export type StudyArea = {
    _id: string;
    name: string;
    description?: string;
    archived: boolean;
};

export async function listStudyAreas(): Promise<StudyArea[]> {
    const response = await fetch("/api/study-areas", {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Não foi possível carregar áreas.");
    return (await response.json()) as StudyArea[];
}

export async function createStudyArea(payload: {
    name: string;
    description?: string;
}): Promise<StudyArea> {
    const response = await fetch("/api/study-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível criar área.");
    return data as StudyArea;
}