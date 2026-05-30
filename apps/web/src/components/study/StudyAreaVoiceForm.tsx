import { FormEvent, useState } from "react";
import { updateStudyAreaVoice } from "../../lib/apiClient";

export function StudyAreaVoiceForm({ studyAreaId }: { studyAreaId: string }) {
    const [voiceTone, setVoiceTone] = useState<
        "simple" | "rigorous" | "step_by_step" | "examples_first"
    >("step_by_step");
    const [voiceDetailLevel, setVoiceDetailLevel] = useState<
        "short" | "normal" | "detailed"
    >("normal");
    const [voiceNotes, setVoiceNotes] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await updateStudyAreaVoice(studyAreaId, {
            voiceTone,
            voiceDetailLevel,
            voiceNotes,
        });
        setFeedback("Estilo pedagógico guardado.");
    }

    return (
        <form
            className="space-y-3 rounded border bg-white p-4"
            onSubmit={handleSubmit}
        >
            <p className="text-sm text-slate-600">
                Voz significa estilo de explicação, não áudio.
            </p>
            <select
                className="w-full rounded border px-3 py-2"
                onChange={(event) =>
                    setVoiceTone(event.target.value as typeof voiceTone)
                }
                value={voiceTone}
            >
                <option value="simple">Mais simples</option>
                <option value="rigorous">Mais rigoroso</option>
                <option value="step_by_step">Passo a passo</option>
                <option value="examples_first">Com exemplos primeiro</option>
            </select>
            <select
                className="w-full rounded border px-3 py-2"
                onChange={(event) =>
                    setVoiceDetailLevel(
                        event.target.value as typeof voiceDetailLevel,
                    )
                }
                value={voiceDetailLevel}
            >
                <option value="short">Curto</option>
                <option value="normal">Normal</option>
                <option value="detailed">Detalhado</option>
            </select>
            <textarea
                className="w-full rounded border px-3 py-2"
                maxLength={500}
                onChange={(event) => setVoiceNotes(event.target.value)}
                placeholder="Notas curtas sobre o estilo pretendido"
                value={voiceNotes}
            />
            {feedback && (
                <p className="rounded bg-green-50 p-3 text-green-700">
                    {feedback}
                </p>
            )}
            <button
                className="rounded bg-slate-900 px-4 py-2 text-white"
                type="submit"
            >
                Guardar estilo
            </button>
        </form>
    );
}