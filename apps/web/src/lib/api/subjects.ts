// apps/web/src/lib/api/subjects.ts
export type SubjectView = {
    id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createSubject(
    classId: string,
    input: { name: string; code?: string; description?: string },
) {
    const response = await fetch(`/api/teacher/classes/${classId}/subjects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<SubjectView>(response);
}

export async function listSubjects(classId: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/subjects`, {
        credentials: "include",
    });

    return parseResponse<SubjectView[]>(response);
}