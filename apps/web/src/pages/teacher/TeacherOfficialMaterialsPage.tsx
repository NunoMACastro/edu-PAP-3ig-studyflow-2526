// apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    OfficialMaterialView,
    createOfficialMaterial,
    listOfficialMaterials,
} from "../../lib/api/officialMaterials";

type Props = {
    subjectId: string;
};

export function TeacherOfficialMaterialsPage({ subjectId }: Props) {
    const [materials, setMaterials] = useState<OfficialMaterialView[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setMaterials(await listOfficialMaterials(subjectId));
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [subjectId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);

        try {
            await createOfficialMaterial(subjectId, {
                title: String(form.get("title") ?? ""),
                type,
                textContent: String(form.get("textContent") ?? ""),
                sourceUrl: String(form.get("sourceUrl") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Material oficial guardado.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar o material.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Materiais oficiais</h1>
            <form onSubmit={handleSubmit}>
                <input name="title" placeholder="Título" required />
                <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                    <option value="TEXT">Texto</option>
                    <option value="URL">URL</option>
                </select>
                {type === "TEXT" ? <textarea name="textContent" required /> : null}
                {type === "URL" ? <input name="sourceUrl" type="url" required /> : null}
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A guardar" : "Guardar material"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar materiais.</p> : null}
            {!isLoading && materials.length === 0 ? <p>Ainda não existem materiais oficiais.</p> : null}

            {materials.map((material) => (
                <article key={material.id}>
                    <h2>{material.title}</h2>
                    <p>{material.type} · {material.status}</p>
                </article>
            ))}
        </main>
    );
}