import { FormEvent, useEffect, useState } from "react";
import {
    AiContentReview,
    createAiContentReview,
    decideAiContentReview,
    listAiContentReviews,
} from "../../lib/apiClient.js";

/**
 * Página docente para rever conteúdo gerado por IA.
 */
export function TeacherAiContentReviewsPage({ subjectId }: { subjectId: string }) {
    const [reviews, setReviews] = useState<AiContentReview[]>([]);
    const [materialId, setMaterialId] = useState("");
    const [contentType, setContentType] = useState<"SUMMARY" | "QUIZ">("SUMMARY");
    const [contentText, setContentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setReviews(await listAiContentReviews(subjectId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar revisões."),
        );
    }, [subjectId]);

    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createAiContentReview(subjectId, {
                materialId,
                contentType,
                contentJson: { text: contentText },
            });
            setMaterialId("");
            setContentText("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar revisão.");
        }
    }

    async function decide(reviewId: string, status: "APPROVED" | "REJECTED") {
        setError(null);
        try {
            await decideAiContentReview(reviewId, { status });
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao decidir revisão.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Revisões IA</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <input value={materialId} onChange={(event) => setMaterialId(event.target.value)} placeholder="ID do material oficial" />
                <select value={contentType} onChange={(event) => setContentType(event.target.value as "SUMMARY" | "QUIZ")}>
                    <option value="SUMMARY">Resumo</option>
                    <option value="QUIZ">Quiz</option>
                </select>
                <textarea value={contentText} onChange={(event) => setContentText(event.target.value)} placeholder="Conteúdo gerado a rever" />
                <button className="sf-button-primary" disabled={!materialId.trim() || !contentText.trim()}>
                    Criar revisão
                </button>
            </form>
            <div className="grid gap-3">
                {reviews.length === 0 ? <p className="sf-panel text-sm text-slate-600">Sem conteúdo pendente de revisão.</p> : null}
                {reviews.map((review) => (
                    <article className="sf-panel space-y-2" key={review._id}>
                        <h2 className="font-semibold">{review.contentType}</h2>
                        <p className="text-sm text-slate-600">{review.status} · material {review.materialId}</p>
                        <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">
                            {JSON.stringify(review.contentJson, null, 2)}
                        </pre>
                        {review.status === "PENDING" ? (
                            <div className="flex flex-wrap gap-2">
                                <button className="sf-button-secondary" onClick={() => void decide(review._id, "APPROVED")}>Aprovar</button>
                                <button className="sf-button-secondary" onClick={() => void decide(review._id, "REJECTED")}>Rejeitar</button>
                            </div>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
