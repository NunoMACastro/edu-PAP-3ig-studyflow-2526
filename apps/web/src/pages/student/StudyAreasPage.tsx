import { FormEvent, useEffect, useState } from "react";
import { createStudyArea, listStudyAreas, StudyArea } from "../../lib/apiClient.js";

/**
 * Página de criação e listagem de áreas de estudo.
 *
 * @returns Gestão simples de áreas pessoais.
 */
export function StudyAreasPage() {
    const [areas, setAreas] = useState<StudyArea[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega áreas da API.
     *
     * @returns Promise resolvida depois de atualizar estado.
     */
    async function refresh(): Promise<void> {
        setAreas(await listStudyAreas());
    }

    useEffect(() => {
        void refresh();
    }, []);

    /**
     * Cria uma nova área.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de criar.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createStudyArea({ name, description });
            setName("");
            setDescription("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Áreas de estudo</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <div className="space-y-2">
                    <label htmlFor="areaName">Nome</label>
                    <input id="areaName" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label htmlFor="areaDescription">Descrição</label>
                    <textarea id="areaDescription" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
                </div>
                <button className="sf-button-primary" type="submit">Criar área</button>
            </form>
            <div className="grid gap-3">
                {areas.map((area) => (
                    <a className="sf-panel block hover:border-teal-300" href={`/app/areas/${area._id}`} key={area._id}>
                        <h2 className="font-semibold">{area.name}</h2>
                        {area.description ? <p className="mt-1 text-sm text-slate-600">{area.description}</p> : null}
                    </a>
                ))}
            </div>
        </section>
    );
}
