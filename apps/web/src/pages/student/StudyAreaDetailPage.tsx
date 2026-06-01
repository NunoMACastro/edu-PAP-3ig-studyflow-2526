import { useEffect, useState } from "react";
import { AiAreaProfilePanel } from "../../components/ai/AiAreaProfilePanel.js";
import { StudyAreaVoiceForm } from "../../components/study/StudyAreaVoiceForm.js";
import { getStudyArea, StudyArea } from "../../lib/apiClient.js";

type StudyAreaDetailPageProps = {
    studyAreaId: string;
};

/**
 * Página de detalhe de uma área.
 *
 * @param props Identificador da área.
 * @returns Detalhe, atalhos, voz e perfil IA.
 */
export function StudyAreaDetailPage({ studyAreaId }: StudyAreaDetailPageProps) {
    const [area, setArea] = useState<StudyArea | null>(null);

    useEffect(() => {
        void getStudyArea(studyAreaId).then(setArea);
    }, [studyAreaId]);

    if (!area) return <p className="text-sm text-slate-600">A carregar área...</p>;

    return (
        <section className="space-y-6">
            <div className="sf-panel">
                <h1 className="text-2xl font-bold">{area.name}</h1>
                {area.description ? <p className="mt-2 text-slate-600">{area.description}</p> : null}
                <div className="mt-4 flex flex-wrap gap-3">
                    <a className="sf-button-primary" href={`/app/areas/${area._id}/materiais`}>Materiais</a>
                    <a className="sf-button-secondary" href={`/app/areas/${area._id}/ferramentas`}>IA</a>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <StudyAreaVoiceForm area={area} onSaved={setArea} />
                <AiAreaProfilePanel studyAreaId={area._id} />
            </div>
        </section>
    );
}
