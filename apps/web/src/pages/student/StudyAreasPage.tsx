import { FormEvent, useEffect, useState } from "react";
import {
    createStudyArea,
    listStudyAreas,
    StudyArea,
} from "../../lib/apiClient";

export function StudyAreasPage() {
    const [areas, setAreas] = useState<StudyArea[]>([]);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudyAreas()
            .then(setAreas)
            .catch((err) => setError(err.message));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        try {
            const created = await createStudyArea({ name });
            setAreas((current) => [...current, created]);
            setName("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao criar área.",
            );
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-2xl font-semibold">Áreas de estudo</h1>
            <form className="mt-6 flex gap-3" onSubmit={handleSubmit}>
                <input
                    className="flex-1 rounded border px-3 py-2"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Matemática A"
                    required
                    value={name}
                />
                <button
                    className="rounded bg-slate-900 px-4 py-2 text-white"
                    type="submit"
                >
                    Criar área
                </button>
            </form>
            {error && (
                <p className="mt-4 rounded bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}
            <ul className="mt-6 space-y-3">
                {areas.map((area) => (
                    <li className="rounded border bg-white p-4" key={area._id}>
                        {area.name}
                    </li>
                ))}
            </ul>
        </main>
    );
}