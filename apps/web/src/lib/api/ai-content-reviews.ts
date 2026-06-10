// apps/web/src/lib/api/ai-content-reviews.ts
export type AiContentReviewView = { id: string; kind: "SUMMARY" | "QUIZ"; status: "PENDING" | "APPROVED" | "REJECTED"; generatedContent: string; rejectionReason: string | null };
export type CreateAiContentReviewInput = { materialId: string; kind: "SUMMARY" | "QUIZ"; generatedContent: string };
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
export function listAiContentReviews(subjectId: string) {
    return requestJson<AiContentReviewView[]>("/api/teacher/subjects/" + subjectId + "/ai-content-reviews");
}
export function createAiContentReview(subjectId: string, input: CreateAiContentReviewInput) {
    return requestJson<AiContentReviewView>("/api/teacher/subjects/" + subjectId + "/ai-content-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}
export function decideAiContentReview(subjectId: string, reviewId: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) {
    return requestJson<AiContentReviewView>("/api/teacher/subjects/" + subjectId + "/ai-content-reviews/" + reviewId + "/decision", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, rejectionReason }) });
}