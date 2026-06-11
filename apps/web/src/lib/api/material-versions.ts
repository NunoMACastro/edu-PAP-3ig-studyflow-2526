// apps/web/src/lib/api/material-versions.ts
export type MaterialVersionView = { id: string; materialId: string; jobId: string; versionNumber: number; title: string; changeSummary: string[] };
export type CreateMaterialVersionInput = { title: string; changeSummary: string[] };
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
export function listMaterialVersions(jobId: string) {
    return requestJson<MaterialVersionView[]>("/api/material-index/jobs/" + jobId + "/versions");
}
export function createMaterialVersion(jobId: string, input: CreateMaterialVersionInput) {
    return requestJson<MaterialVersionView>("/api/material-index/jobs/" + jobId + "/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}