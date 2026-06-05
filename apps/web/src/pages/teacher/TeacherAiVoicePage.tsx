// apps/web/src/pages/teacher/TeacherAiVoicePage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    TeacherAiVoiceView,
    getTeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/api/teacherAiVoice";

type Props = {
    subjectId: string;
};

export function TeacherAiVoicePage({ subjectId }: Props) {
    const [voice, setVoice] = useState<TeacherAiVoiceView | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setError("");
        getTeacherAiVoice(subjectId)
            .then(setVoice)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [subjectId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);
        const rules = String(form.get("rules") ?? "")
            .split("\n")
            .map((rule) => rule.trim())
            .filter(Boolean);

        try {
            const updated = await updateTeacherAiVoice(subjectId, {
                tone: String(form.get("tone") ?? "CALM") as TeacherAiVoiceView["tone"],
                detailLevel: String(form.get("detailLevel") ?? "BALANCED") as TeacherAiVoiceView["detailLevel"],
                rules,
            });
            setVoice(updated);
            setNotice("Voz da IA docente guardada.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar a voz.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Voz da IA docente</h1>
            {isLoading ? <p>A carregar voz da IA.</p> : null}
            {!isLoading && !voice ? <p>Ainda não existe voz personalizada para esta disciplina.</p> : null}
            <form key={voice?.id ?? "new-voice"} onSubmit={handleSubmit}>
                <select name="tone" defaultValue={voice?.tone ?? "CALM"}>
                    <option value="CALM">Calma</option>
                    <option value="DIRECT">Direta</option>
                    <option value="SOCRATIC">Socrática</option>
                </select>
                <select name="detailLevel" defaultValue={voice?.detailLevel ?? "BALANCED"}>
                    <option value="SHORT">Curta</option>
                    <option value="BALANCED">Equilibrada</option>
                    <option value="DETAILED">Detalhada</option>
                </select>
                <textarea name="rules" defaultValue={voice?.rules.join("\n") ?? ""} />
                <button type="submit" disabled={isSaving || isLoading}>
                    {isSaving ? "A guardar" : "Guardar voz"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
        </main>
    );
}