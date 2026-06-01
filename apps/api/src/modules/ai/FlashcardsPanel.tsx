import { AiArtifact } from "../../lib/apiClient";

export function FlashcardsPanel({ artifact }: { artifact: AiArtifact | null }) {
    if (!artifact) return <p>Gera flashcards para reveres a matéria.</p>;

    const content = artifact.contentJson as {
        cards?: Array<{ front: string; back: string }>;
    };

    return (
        <ul className="grid gap-3 md:grid-cols-2">
            {(content.cards ?? []).map((card) => (
                <li className="rounded border bg-white p-4" key={card.front}>
                    <strong>{card.front}</strong>
                    <p className="mt-2">{card.back}</p>
                </li>
            ))}
        </ul>
    );
}