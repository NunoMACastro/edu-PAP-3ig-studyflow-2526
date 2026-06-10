// apps/web/src/pages/mf2/MaterialIndexPage.tsx
import { FormEvent, useState } from "react";
import { startPrivateMaterialIndex, startOfficialMaterialIndex, MaterialIndexJobView } from "../../lib/api/material-index";

export function MaterialIndexPage() {
    const [contextId, setContextId] = useState("");
    const [materialId, setMaterialId] = useState("");
    const [mode, setMode] = useState<"PRIVATE" | "OFFICIAL">("PRIVATE");
    const [job, setJob] = useState<MaterialIndexJobView | null>(null);
    const [error, setError] = useState("");
    async function submit(event: FormEvent) {
        event.preventDefault();

        try {
            const nextJob =
                mode === "PRIVATE"
                    ? await startPrivateMaterialIndex(contextId.trim(), materialId.trim())
                    : await startOfficialMaterialIndex(contextId.trim(), materialId.trim());
            setJob(nextJob);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao iniciar indexação.");
        }
    }
    return (
        <main>
            <h1>Indexação de materiais</h1>
            <form onSubmit={submit}>
                <select value={mode} onChange={(event) => setMode(event.target.value === "OFFICIAL" ? "OFFICIAL" : "PRIVATE")}>
                    <option value="PRIVATE">Área privada</option>
                    <option value="OFFICIAL">Disciplina oficial</option>
                </select>
                <input value={contextId} onChange={(event) => setContextId(event.target.value)} placeholder="ID do contexto" />
                <input value={materialId} onChange={(event) => setMaterialId(event.target.value)} placeholder="ID do material" />
                <button type="submit">Indexar</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {job && <p>Job {job.id}: {job.status}</p>}
        </main>
    );
}