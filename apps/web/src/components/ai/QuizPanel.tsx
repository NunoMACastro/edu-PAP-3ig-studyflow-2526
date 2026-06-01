import { AiArtifact } from "../../lib/apiClient.js";
import { ArtifactSources } from "./ArtifactSources.js";

type QuizPanelProps = {
    artifact: AiArtifact | null;
};

/**
 * Mostra um quiz gerado pela IA.
 *
 * @param props Artefacto de quiz.
 * @returns Lista de perguntas com opções.
 */
export function QuizPanel({ artifact }: QuizPanelProps) {
    if (!artifact) return null;
    const content = artifact.contentJson as {
        questions?: Array<{
            question: string;
            options: string[];
            correctOptionIndex: number;
            explanation: string;
            sourceMaterialIds?: string[];
        }>;
    };

    return (
        <div className="space-y-4">
            {(content.questions ?? []).map((question, index) => (
                <article className="sf-panel space-y-3" key={index}>
                    <h2 className="font-semibold">{question.question}</h2>
                    <ol className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                            <li className="rounded-md border border-slate-200 px-3 py-2 text-sm" key={optionIndex}>
                                {optionIndex + 1}. {option}
                            </li>
                        ))}
                    </ol>
                    <p className="text-sm text-teal-800">
                        Correta: {question.correctOptionIndex + 1}. {question.explanation}
                    </p>
                    <ArtifactSources
                        sourceMaterialIds={question.sourceMaterialIds}
                        sources={artifact.sourcesJson}
                    />
                </article>
            ))}
        </div>
    );
}
