// apps/web/src/lib/api/roomAi.ts
export type RoomAiAnswer = {
    id: string;
    answer: string;
    sources: Array<{ shareId: string; title: string }>;
};

export async function askRoomAi(roomId: string, input: { question: string; sourceIds?: string[] }) {
    const response = await fetch(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<RoomAiAnswer>;
}