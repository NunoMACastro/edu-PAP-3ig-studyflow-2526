// apps/web/src/lib/api/class-projects.ts
export type ClassProjectView = { id: string; title: string; brief: string; dueDate: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };
export type CreateClassProjectInput = { title: string; brief: string; dueDate?: string };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, credentials: "include" });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json() as Promise<T>;
}

export function listClassProjects(classId: string) {
    return requestJson<ClassProjectView[]>("/api/teacher/classes/" + classId + "/projects");
}

export function createClassProject(classId: string, input: CreateClassProjectInput) {
    return requestJson<ClassProjectView>("/api/teacher/classes/" + classId + "/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function publishClassProject(classId: string, projectId: string) {
    return requestJson<ClassProjectView>("/api/teacher/classes/" + classId + "/projects/" + projectId + "/publish", { method: "PATCH" });
}

export function listStudentClassProjects(classId: string) {
    return requestJson<ClassProjectView[]>("/api/student/classes/" + classId + "/projects");
}