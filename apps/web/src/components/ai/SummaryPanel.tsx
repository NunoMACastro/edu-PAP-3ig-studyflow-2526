import { useState } from "react";
import { generateSummary } from "../../lib/apiClient";

export function SummaryPanel({ studyAreaId }: { studyAreaId: string }) {
    const [summary, setSummary] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        setError(null);
        try {
            setSummary(await generateSummary(studyAreaId));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao gerar resumo.",
            );
        }
    }

    return (
        <section className="rounded border bg-white p-4">
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white"
                onClick={handleGenerate}
                type="button"
            >
                Gerar resumo
            </button>
            {error && (
                <p className="mt-3 rounded bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}
            {summary && (
                <pre className="mt-3 overflow-auto rounded bg-slate-50 p-3 text-sm">
                    {JSON.stringify(summary.contentJson, null, 2)}
                </pre>
            )}
        </section>
    );
}