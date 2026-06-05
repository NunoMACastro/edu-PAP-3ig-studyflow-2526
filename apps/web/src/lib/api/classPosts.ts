// apps/web/src/lib/api/classPosts.ts
export type ClassPostView = {
    id: string;
    classId: string;
    teacherId: string;
    type: "NOTICE" | "POST";
    title: string;
    body: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createClassPost(
    classId: string,
    input: { type: "NOTICE" | "POST"; title: string; body: string },
) {
    const response = await fetch(`/api/teacher/classes/${classId}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<ClassPostView>(response);
}

export async function listTeacherClassPosts(classId: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/posts`, {
        credentials: "include",
    });

    return parseResponse<ClassPostView[]>(response);
}

export async function listClassPostsForStudent(classId: string) {
    const response = await fetch(`/api/student/classes/${classId}/posts`, {
        credentials: "include",
    });

    return parseResponse<ClassPostView[]>(response);
}