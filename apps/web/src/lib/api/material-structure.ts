// apps/web/src/lib/api/material-structure.ts
export type MaterialReferenceView = {
    chunkOrder: number;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};
export type MaterialStructureView = {
    id: string;
    jobId: string;
    materialId: string;
    topics: string[];
    sections: {
        order: number;
        title: string;
        summary: string;
        references: MaterialReferenceView[];
    }[];
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
export function getMaterialStructure(jobId: string) {
    return requestJson<MaterialStructureView | null>("/api/material-index/jobs/" + jobId + "/structure");
}
export function createMaterialStructure(jobId: string, manualTopics?: string[]) {
    return requestJson<MaterialStructureView>("/api/material-index/jobs/" + jobId + "/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualTopics }),
    });
}