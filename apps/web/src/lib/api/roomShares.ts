// apps/web/src/lib/api/roomShares.ts
export type RoomShareView = {
    id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent: string;
    sourceUrl: string;
    materialId: string;
    usableByAi: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createRoomShare(
    roomId: string,
    input: {
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        sourceUrl?: string;
        materialId?: string;
        copiedText?: string;
    },
) {
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<RoomShareView>(response);
}

export async function listRoomShares(roomId: string) {
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        credentials: "include",
    });

    return parseResponse<RoomShareView[]>(response);
}