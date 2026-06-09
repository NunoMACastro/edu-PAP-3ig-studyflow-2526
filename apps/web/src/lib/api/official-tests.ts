// apps/web/src/lib/api/official-tests.ts
export type OfficialTestView = { id: string; title: string; type: "MINI_TEST" | "TEST"; questionCount: number };
export type OfficialTestQuestionInput = { statement: string; options: string[]; correctAnswer: string };
export type CreateOfficialTestInput = { title: string; type: "MINI_TEST" | "TEST"; questions: OfficialTestQuestionInput[] };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
        ...init,
        // Envia o cookie HttpOnly da sessão; o frontend nunca guarda tokens manualmente.
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}
export function listOfficialTests(subjectId: string) {
    return requestJson<OfficialTestView[]>("/api/teacher/subjects/" + subjectId + "/tests");
}
export function createOfficialTest(subjectId: string, input: CreateOfficialTestInput) {
    return requestJson<OfficialTestView>("/api/teacher/subjects/" + subjectId + "/tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}