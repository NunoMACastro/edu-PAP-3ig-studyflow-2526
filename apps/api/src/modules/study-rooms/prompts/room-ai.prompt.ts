// apps/api/src/modules/study-rooms/prompts/room-ai.prompt.ts
import { RoomShareDocument } from "../schemas/room-share.schema";

export function buildRoomAiPrompt(question: string, shares: RoomShareDocument[]) {
    const sources = shares
        .map((share, index) => {
            return `Fonte ${index + 1}: ${share.title}\n${share.textContent ?? ""}`;
        })
        .join("\n\n");

    return [
        "Responde apenas com base nas fontes partilhadas nesta sala.",
        "Se as fontes não cobrirem a pergunta, diz que a sala ainda não tem material suficiente.",
        `Pergunta: ${question}`,
        sources,
        "Devolve JSON com as chaves answer e sourceShareIds.",
    ].join("\n\n");
}