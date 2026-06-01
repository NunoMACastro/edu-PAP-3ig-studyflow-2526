import { useState } from "react";
import { AiAreaProfile, prepareAiAreaProfile } from "../../lib/apiClient";

export function AiAreaProfilePanel({ studyAreaId }: { studyAreaId: string }) {
    const [profile, setProfile] = useState<AiAreaProfile | null>(null);

    async function handlePrepare() {
        setProfile(await prepareAiAreaProfile(studyAreaId));
    }

    return (
        <section className="rounded border bg-white p-4">
            <h2 className="font-semibold">Perfil IA da área</h2>
            <button
                className="mt-3 rounded bg-slate-900 px-4 py-2 text-white"
                onClick={handlePrepare}
                type="button"
            >
                Preparar perfil IA
            </button>
            {profile?.status === "MISSING_MATERIALS" && (
                <p className="mt-3">Adiciona materiais para preparar a IA.</p>
            )}
            {profile?.status === "PENDING_PROCESSING" && (
                <p className="mt-3">
                    Há materiais, mas ainda não há fontes processáveis.
                </p>
            )}
            {profile?.status === "READY_FOR_GENERATION" && (
                <p className="mt-3">
                    A área tem fontes processáveis para gerar conteúdos.
                </p>
            )}
        </section>
    );
}