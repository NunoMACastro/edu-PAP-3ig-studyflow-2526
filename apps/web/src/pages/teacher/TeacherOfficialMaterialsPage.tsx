import { FormEvent, useEffect, useState } from "react";
import {
    createOfficialMaterial,
    listOfficialMaterials,
    OfficialMaterial,
} from "../../lib/apiClient.js";

type TeacherOfficialMaterialsPageProps = {
    subjectId: string;
};

/**
 * Página de materiais oficiais da disciplina.
 */
export function TeacherOfficialMaterialsPage({ subjectId }: TeacherOfficialMaterialsPageProps) {
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        setMaterials(await listOfficialMaterials(subjectId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar materiais."),
        );
    }, [subjectId]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createOfficialMaterial(subjectId, {
                title,
                type,
                textContent: type === "TEXT" ? textContent : undefined,
                sourceUrl: type === "URL" ? sourceUrl : undefined,
            });
            setTitle("");
            setTextContent("");
            setSourceUrl("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar material.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Materiais oficiais</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                    <option value="TEXT">Texto processado</option>
                    <option value="URL">Referência URL</option>
                </select>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                {type === "TEXT" ? (
                    <textarea rows={8} value={textContent} onChange={(event) => setTextContent(event.target.value)} placeholder="Conteúdo textual oficial" />
                ) : (
                    <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." />
                )}
                <button className="sf-button-primary">Guardar material</button>
            </form>
            <div className="grid gap-3">
                {materials.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não há materiais oficiais.</p> : null}
                {materials.map((material) => (
                    <article className="sf-panel space-y-1" key={material._id}>
                        <h2 className="font-semibold">{material.title}</h2>
                        <p className="text-sm text-slate-600">{material.type} · {material.status}</p>
                        {material.sourceUrl ? <a className="text-sm text-teal-700" href={material.sourceUrl}>{material.sourceUrl}</a> : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
