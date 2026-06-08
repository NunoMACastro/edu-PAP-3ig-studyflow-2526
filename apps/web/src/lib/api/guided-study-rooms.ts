// apps/web/src/lib/api/guided-study-rooms.ts
export type GuidedStudyRoomView = {
    id: string;
    title: string;
    description: string;
    materialIds: string[];
    status: "OPEN" | "CLOSED";
};

export type CreateGuidedStudyRoomInput = {
    title: string;
    description: string;
    materialIds?: string[];
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, credentials: "include" });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json() as Promise<T>;
}

export function listTeacherGuidedStudyRooms(classId: string) {
    return requestJson<GuidedStudyRoomView[]>("/api/teacher/classes/" + classId + "/guided-study-rooms");
}

export function createGuidedStudyRoom(classId: string, input: CreateGuidedStudyRoomInput) {
    return requestJson<GuidedStudyRoomView>("/api/teacher/classes/" + classId + "/guided-study-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
}

export function listStudentGuidedStudyRooms(classId: string) {
    return requestJson<GuidedStudyRoomView[]>("/api/student/classes/" + classId + "/guided-study-rooms");
}