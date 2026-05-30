import { FormEvent, useState } from "react";
import {
    Material,
    submitFileMaterial,
    submitTopicMaterial,
    submitUrlMaterial,
} from "../../lib/apiClient";

type MaterialMode = "TOPIC" | "URL" | "FILE";

export function MaterialSubmitForm({
    studyAreaId,
    onCreated,
}: {
    studyAreaId: string;
    onCreated: (material: Material) => void;
}) {
    const [mode, setMode] = useState<MaterialMode>("TOPIC");
    const [title, setTitle] = useState("");
    const [topicText, setTopicText] = useState("");
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            const material =
                mode === "TOPIC"
                    ? await submitTopicMaterial(studyAreaId, {
                          title,
                          topicText,
                      })
                    : mode === "URL"
                      ? await submitUrlMaterial(studyAreaId, { title, url })
                      : await submitFileMaterial(studyAreaId, {
                            title,
                            file: requireSelectedFile(file),
                        });

            onCreated(material);
            setTitle("");
            setTopicText("");
            setUrl("");
            setFile(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao submeter material.",
            );
        }
    }

    return (
        <form
            className="space-y-3 rounded border bg-white p-4"
            onSubmit={handleSubmit}
        >
            <select
                className="w-full rounded border px-3 py-2"
                onChange={(event) =>
                    setMode(event.target.value as MaterialMode)
                }
                value={mode}
            >
                <option value="TOPIC">Tópico manual</option>
                <option value="URL">URL</option>
                <option value="FILE">PDF/DOCX</option>
            </select>
            <input
                className="w-full rounded border px-3 py-2"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Título do material"
                required
                value={title}
            />

            {mode === "TOPIC" && (
                <textarea
                    className="min-h-32 w-full rounded border px-3 py-2"
                    onChange={(event) => setTopicText(event.target.value)}
                    placeholder="Escreve um tópico ou apontamento manual"
                    required
                    value={topicText}
                />
            )}

            {mode === "URL" && (
                <input
                    className="w-full rounded border px-3 py-2"
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://exemplo.pt/recurso"
                    required
                    type="url"
                    value={url}
                />
            )}

            {mode === "FILE" && (
                <input
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="w-full rounded border px-3 py-2"
                    onChange={(event) =>
                        setFile(event.target.files?.[0] ?? null)
                    }
                    required
                    type="file"
                />
            )}

            {error && (
                <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>
            )}
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white"
                type="submit"
            >
                Submeter material
            </button>
        </form>
    );
}

function requireSelectedFile(file: File | null): File {
    if (!file) throw new Error("Escolhe um ficheiro PDF ou DOCX.");
    return file;
}