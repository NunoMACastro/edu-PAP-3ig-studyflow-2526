import { AiArtifact } from "../../lib/apiClient";

export function QuizPanel({ artifact }: { artifact: AiArtifact | null }) {
    if (!artifact) return <p>Gera um quiz para praticares.</p>;

    const content = artifact.contentJson as {
        questions?: Array<{
            question: string;
            options: string[];
            correctOptionIndex: number;
            explanation: string;
        }>;
    };

    return (
        <ol className="space-y-4">
            {(content.questions ?? []).map((question, index) => (
                <li
                    className="rounded border bg-white p-4"
                    key={question.question}
                >
                    <strong>
                        {index + 1}. {question.question}
                    </strong>
                    <ul className="mt-3 space-y-2">
                        {question.options.map((option, optionIndex) => (
                            <li
                                className={
                                    optionIndex === question.correctOptionIndex
                                        ? "font-semibold text-green-700"
                                        : ""
                                }
                                key={option}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-sm">{question.explanation}</p>
                </li>
            ))}
        </ol>
    );
}