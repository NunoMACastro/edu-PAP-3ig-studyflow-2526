// apps/web/src/pages/mf2/MaterialStructurePage.tsx
import { useState } from "react";
// Provide a minimal JSX typing fallback for environments missing React types
// (avoids many TS errors when `react`/`@types/react` aren't available).
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}
import { createMaterialStructure, MaterialStructureView } from "../../lib/api/material-structure";

export function MaterialStructurePage() {
    const [jobId, setJobId] = useState("");
    const [structure, setStructure] = useState<MaterialStructureView | null>(null);
    const [error, setError] = useState("");
    async function extract() {
        try {
            setStructure(await createMaterialStructure(jobId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao extrair estrutura.");
        }
    }
    return (
        <main>
            <h1>Estrutura do material</h1>
            <input value={jobId} onChange={(event: any) => setJobId(event.target.value)} placeholder="ID do job" />
            <button type="button" onClick={extract}>Extrair</button>
            {error && <p role="alert">{error}</p>}
            {structure && (
                <ul>
                    {structure.sections.map((section) => (
                        <li key={section.order}>
                            <h2>{section.title}</h2>
                            <p>{section.summary}</p>
                            <ul>
                                {section.references.map((reference) => (
                                    <li key={`${reference.chunkOrder}-${reference.locator}`}>
                                        {reference.sourceLabel} · {reference.locator} · {reference.excerpt}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}