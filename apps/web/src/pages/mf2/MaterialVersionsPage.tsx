// apps/web/src/pages/mf2/MaterialVersionsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createMaterialVersion, listMaterialVersions, MaterialVersionView } from "../../lib/api/material-versions";

export function MaterialVersionsPage() {
    const [jobId, setJobId] = useState("");
    const [title, setTitle] = useState("");
    const [versions, setVersions] = useState<MaterialVersionView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!jobId.trim()) return;

        try {
            setVersions(await listMaterialVersions(jobId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar versões.");
        }
    }
    useEffect(() => {
        void load();
    }, [jobId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await createMaterialVersion(jobId.trim(), {
            title,
            changeSummary: ["Nova versão revista"],
        });
        setTitle("");
        await load();
    }
    return (
        <main>
            <h1>Versões do material</h1>
            <form onSubmit={submit}>
                <input value={jobId} onChange={(event) => setJobId(event.target.value)} placeholder="ID do job" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título da versão" />
                <button type="submit">Criar versão</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ol>
                {versions.map((version) => (
                    <li key={version.id}>v{version.versionNumber} - {version.title}</li>
                ))}
            </ol>
        </main>
    );
}