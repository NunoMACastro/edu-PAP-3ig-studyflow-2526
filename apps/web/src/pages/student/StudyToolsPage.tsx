import { FormEvent, useState } from "react";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel.js";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel.js";
import { QuizPanel } from "../../components/ai/QuizPanel.js";
import { SummaryPanel } from "../../components/ai/SummaryPanel.js";
import { AiArtifact, generateStudyTool, generateSummary, StudyToolType } from "../../lib/apiClient.js";

type StudyToolsPageProps = {
    studyAreaId: string;
};

/**
 * Página de resumos e ferramentas IA da área.
 *
 * @param props Identificador da área.
 * @returns Controlos de geração e resultado.
 */
export function StudyToolsPage({ studyAreaId }: StudyToolsPageProps) {
    const [type, setType] = useState<StudyToolType>("EXPLANATION");
    const [topic, setTopic] = useState("");
    const [artifact, setArtifact] = useState<AiArtifact | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Gera um resumo para a área.
     *
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleSummary(): Promise<void> {
        setError(null);
        try {
            setArtifact(await generateSummary(studyAreaId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível gerar.");
        }
    }

    /**
     * Gera a ferramenta de estudo escolhida.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleTool(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            setArtifact(await generateStudyTool(studyAreaId, { type, topic }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível gerar.");
        }
    }

    return (
        <section className="space-y-6">
            <div className="sf-panel space-y-4">
                <h1 className="text-xl font-bold">IA da área</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <div className="flex flex-wrap gap-3">
                    <button className="sf-button-secondary" type="button" onClick={() => void handleSummary()}>
                        Gerar resumo
                    </button>
                </div>
                <form className="grid gap-3 md:grid-cols-[180px_1fr_auto]" onSubmit={(event) => void handleTool(event)}>
                    <select value={type} onChange={(event) => setType(event.target.value as StudyToolType)}>
                        <option value="EXPLANATION">Explicação</option>
                        <option value="FLASHCARDS">Cards</option>
                        <option value="QUIZ">Quiz</option>
                    </select>
                    <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Tópico opcional" />
                    <button className="sf-button-primary" type="submit">Gerar</button>
                </form>
            </div>
            {artifact?.type === "SUMMARY" ? <SummaryPanel artifact={artifact} /> : null}
            {artifact?.type === "EXPLANATION" ? <ExplanationPanel artifact={artifact} /> : null}
            {artifact?.type === "FLASHCARDS" ? <FlashcardsPanel artifact={artifact} /> : null}
            {artifact?.type === "QUIZ" ? <QuizPanel artifact={artifact} /> : null}
        </section>
    );
}
