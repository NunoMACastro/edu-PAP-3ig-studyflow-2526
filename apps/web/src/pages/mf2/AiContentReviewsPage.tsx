// apps/web/src/pages/mf2/AiContentReviewsPage.tsx
import { useEffect, useState } from "react";
import { decideAiContentReview, listAiContentReviews, AiContentReviewView } from "../../lib/api/ai-content-reviews";

export function AiContentReviewsPage() {
    const [subjectId, setSubjectId] = useState("");
    const [reviews, setReviews] = useState<AiContentReviewView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!subjectId.trim()) return;

        try {
            setReviews(await listAiContentReviews(subjectId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar revisões.");
        }
    }
    useEffect(() => {
        void load();
    }, [subjectId]);
    return (
        <main>
            <h1>Revisão de conteúdo IA</h1>
            <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} placeholder="ID da disciplina" />
            {error && <p role="alert">{error}</p>}
            <ul>
                {reviews.map((review) => (
                    <li key={review.id}>
                        {review.kind} - {review.status}
                        <button type="button" onClick={() => decideAiContentReview(subjectId, review.id, "APPROVED").then(load)}>
                            Aprovar
                        </button>
                        <button type="button" onClick={() => decideAiContentReview(subjectId, review.id, "REJECTED", "Rever conteúdo").then(load)}>
                            Rejeitar
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}