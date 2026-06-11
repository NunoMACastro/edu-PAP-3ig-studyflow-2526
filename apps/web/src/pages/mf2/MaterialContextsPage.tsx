// apps/web/src/pages/mf2/MaterialContextsPage.tsx
import { useState } from "react";
import { listPrivateMaterialContexts, listSubjectMaterialContexts, MaterialContextView } from "../../lib/api/material-contexts";

export function MaterialContextsPage() {
    const [contextId, setContextId] = useState("");
    const [mode, setMode] = useState<"PRIVATE" | "SUBJECT">("PRIVATE");
    const [items, setItems] = useState<MaterialContextView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        try {
            const nextItems =
                mode === "PRIVATE"
                    ? await listPrivateMaterialContexts(contextId.trim())
                    : await listSubjectMaterialContexts(contextId.trim());
            setItems(nextItems);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar materiais.");
        }
    }
    return (
        <main>
            <h1>Contextos de materiais</h1>
            <select value={mode} onChange={(event) => setMode(event.target.value === "SUBJECT" ? "SUBJECT" : "PRIVATE")}>
                <option value="PRIVATE">Aluno</option>
                <option value="SUBJECT">Turma</option>
            </select>
            <input value={contextId} onChange={(event) => setContextId(event.target.value)} placeholder="ID do contexto" />
            <button type="button" onClick={load}>Carregar</button>
            {error && <p role="alert">{error}</p>}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>{item.title} - {item.source}</li>
                ))}
            </ul>
        </main>
    );
}