// apps/web/src/lib/api/material-index.ts
export type MaterialTextChunkView = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

export type MaterialIndexJobView = {
    id: string;
    materialId: string;
    contextId: string;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    extractedTextChunks: MaterialTextChunkView[];
    errorMessage: string | null;
};

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
export function startPrivateMaterialIndex(studyAreaId: string, materialId: string) {
    return requestJson<MaterialIndexJobView>("/api/study-areas/" + studyAreaId + "/materials/" + materialId + "/index", { method: "POST" });
}
export function startOfficialMaterialIndex(subjectId: string, materialId: string) {
    return requestJson<MaterialIndexJobView>("/api/teacher/subjects/" + subjectId + "/materials/" + materialId + "/index", { method: "POST" });
}
export function getMaterialIndexJob(jobId: string) {
    return requestJson<MaterialIndexJobView>("/api/material-index/jobs/" + jobId);
}