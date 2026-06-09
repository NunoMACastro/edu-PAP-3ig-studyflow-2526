// apps/web/src/lib/api/project-ai.ts
export type ProjectAiPlanView = { id: string; objective: string; steps: string[]; sourceProjectSections: string[] };
export type CreateProjectAiPlanInput = { objective: string; knownDifficulties?: string[] };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, credentials: "include" });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json() as Promise<T>;
}

export function listProjectAiPlans(classId: string, projectId: string) {
    return requestJson<ProjectAiPlanView[]>("/api/student/classes/" + classId + "/projects/" + projectId + "/ai-plan");
}

export function createProjectAiPlan(classId: string, projectId: string, input: CreateProjectAiPlanInput) {
    return requestJson<ProjectAiPlanView>("/api/student/classes/" + classId + "/projects/" + projectId + "/ai-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}