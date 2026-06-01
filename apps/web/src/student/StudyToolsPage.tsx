import { useState } from "react";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel";
import { QuizPanel } from "../../components/ai/QuizPanel";
import {
    AiArtifact,
    generateStudyTool,
    StudyToolType,
} from "../../lib/apiClient";

export function StudyToolsPage({ studyAreaId }: { studyAreaId: string }) {
    const [type, setType] = useState<StudyToolType>("EXPLANATION");
    const [topic, setTopic] = useState("");
    const [artifact, setArtifact] = useState<AiArtifact | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleGenerate() {
        setError(null);
        setIsLoading(true);
        try {
            setArtifact(
                await generateStudyTool(studyAreaId, {
                    type,
                    topic: topic || undefined,
                }),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao gerar ferramenta.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
            <h1 className="text-2xl font-semibold">Ferramentas de estudo</h1>
            <div className="flex flex-wrap gap-3">
                {(["EXPLANATION", "FLASHCARDS", "QUIZ"] as StudyToolType[]).map(
                    (option) => (
                        <button
                            className={
                                option === type
                                    ? "rounded bg-slate-900 px-4 py-2 text-white"
                                    : "rounded border px-4 py-2"
                            }
                            key={option}
                            onClick={() => setType(option)}
                            type="button"
                        >
                            {option}
                        </button>
                    ),
                )}
            </div>
            <input
                className="w-full rounded border px-3 py-2"
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Foco opcional, por exemplo: funções quadráticas"
                value={topic}
            />
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                disabled={isLoading}
                onClick={handleGenerate}
                type="button"
            >
                {isLoading ? "A gerar..." : "Gerar"}
            </button>
            {error && (
                <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>
            )}
            {type === "EXPLANATION" && (
                <ExplanationPanel
                    artifact={
                        artifact?.type === "EXPLANATION" ? artifact : null
                    }
                />
            )}
            {type === "FLASHCARDS" && (
                <FlashcardsPanel
                    artifact={artifact?.type === "FLASHCARDS" ? artifact : null}
                />
            )}
            {type === "QUIZ" && (
                <QuizPanel
                    artifact={artifact?.type === "QUIZ" ? artifact : null}
                />
            )}
        </main>
    );
}