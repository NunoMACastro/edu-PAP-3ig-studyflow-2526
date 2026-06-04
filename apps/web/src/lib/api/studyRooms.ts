export type StudyRoomView = {
    id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName: string;
    description: string;
    memberIds: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createStudyRoom(input: {
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
}) {
    const response = await fetch("/api/study-rooms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<StudyRoomView>(response);
}

export async function listStudyRooms() {
    const response = await fetch("/api/study-rooms", {
        credentials: "include",
    });

    return parseResponse<StudyRoomView[]>(response);
}

export async function addRoomMember(roomId: string, email: string) {
    const response = await fetch(`/api/study-rooms/${roomId}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    return parseResponse<StudyRoomView>(response);
}