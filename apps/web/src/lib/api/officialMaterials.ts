// apps/web/src/lib/api/officialMaterials.ts
export type OfficialMaterialView = {
    id: string;
    subjectId: string;
    classId: string;
    title: string;
    type: "TEXT" | "URL";
    textContent: string;
    sourceUrl: string;
    status: "PROCESSED" | "REFERENCE_ONLY";
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createOfficialMaterial(
    subjectId: string,
    input: { title: string; type: "TEXT" | "URL"; textContent?: string; sourceUrl?: string },
) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/materials`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<OfficialMaterialView>(response);
}

export async function listOfficialMaterials(subjectId: string) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/materials`, {
        credentials: "include",
    });

    return parseResponse<OfficialMaterialView[]>(response);
}