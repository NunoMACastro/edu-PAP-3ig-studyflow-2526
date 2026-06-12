import { FormEvent, useEffect, useState } from "react";
import {
    createMaterialVersionFromJob,
    listMaterialVersions,
    MaterialVersion,
    restoreMaterialVersion,
} from "../../lib/apiClient.js";

/**
 * Página de gestão de versões produzidas por jobs de indexação concluídos.
 */
export function MaterialVersionsPage({ jobId }: { jobId: string }) {
    const [versions, setVersions] = useState<MaterialVersion[]>([]);
    const [title, setTitle] = useState("");
    const [changeSummary, setChangeSummary] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        void loadVersions();
    }, [jobId]);

    async function loadVersions() {
        try {
            setError(null);
            setVersions(await listMaterialVersions(jobId));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao carregar versões.",
            );
        }
    }

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        try {
            await createMaterialVersionFromJob(jobId, { title, changeSummary });
            setTitle("");
            setChangeSummary("");
            await loadVersions();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao criar versão.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleRestore(versionId: string) {
        try {
            await restoreMaterialVersion(jobId, versionId);
            await loadVersions();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao restaurar versão.",
            );
        }
    }

    return (
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Versões do material</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="sf-panel space-y-3" onSubmit={handleCreate}>
                <input
                    className="sf-input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Título da versão"
                />
                <textarea
                    className="sf-input min-h-24"
                    value={changeSummary}
                    onChange={(event) => setChangeSummary(event.target.value)}
                    placeholder="Resumo das alterações"
                />
                <button className="sf-button-primary" disabled={saving} type="submit">
                    {saving ? "A criar..." : "Criar versão"}
                </button>
            </form>

            <div className="space-y-3">
                {versions.map((version) => (
                    <article className="sf-panel space-y-2" key={version._id}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold">
                                    v{version.versionNumber} · {version.title}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {version.chunksSnapshot.length} blocos indexados
                                </p>
                            </div>
                            <button
                                className="sf-button-secondary"
                                disabled={version.active}
                                onClick={() => void handleRestore(version._id)}
                                type="button"
                            >
                                {version.active ? "Activa" : "Restaurar"}
                            </button>
                        </div>
                        {version.changeSummary ? (
                            <p className="text-sm text-slate-700">{version.changeSummary}</p>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
