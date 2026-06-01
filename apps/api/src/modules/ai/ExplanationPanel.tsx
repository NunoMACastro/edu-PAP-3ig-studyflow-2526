import { AiArtifact } from "../../lib/apiClient";

export function ExplanationPanel({
    artifact,
}: {
    artifact: AiArtifact | null;
}) {
    if (!artifact) return <p>Gera uma explicação para começares.</p>;

    const content = artifact.contentJson as {
        title?: string;
        sections?: Array<{ heading: string; body: string }>;
    };

    return (
        <article className="space-y-4 rounded border bg-white p-4">
            <h2 className="text-xl font-semibold">
                {content.title ?? "Explicação"}
            </h2>
            {(content.sections ?? []).map((section) => (
                <section key={section.heading}>
                    <h3 className="font-semibold">{section.heading}</h3>
                    <p>{section.body}</p>
                </section>
            ))}
        </article>
    );
}