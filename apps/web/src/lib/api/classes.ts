// apps/web/src/lib/api/classes.ts
export type SchoolClassView = {
    id: string;
    teacherId: string;
    name: string;
    code: string;
    schoolYear: string;
    description: string;
    studentIds: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createClass(input: {
    name: string;
    code: string;
    schoolYear: string;
    description?: string;
}) {
    const response = await fetch("/api/teacher/classes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<SchoolClassView>(response);
}

export async function listTeacherClasses() {
    const response = await fetch("/api/teacher/classes", {
        credentials: "include",
    });

    return parseResponse<SchoolClassView[]>(response);
}

export async function addClassStudent(classId: string, email: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    return parseResponse<SchoolClassView>(response);
}

export async function listStudentClasses() {
    const response = await fetch("/api/student/classes", {
        credentials: "include",
    });

    return parseResponse<SchoolClassView[]>(response);
}