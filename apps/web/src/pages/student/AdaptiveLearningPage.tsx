// apps/web/src/pages/student/AdaptiveLearningPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    AdaptiveExplanationView,
    LearningProfileView,
    askAdaptiveExplanation,
    getLearningProfile,
    updateLearningProfile,
} from "../../lib/api/adaptiveLearning";

type Props = {
    studyAreaId: string;
};

export function AdaptiveLearningPage({ studyAreaId }: Props) {
    const [profile, setProfile] = useState<LearningProfileView | null>(null);
    const [explanation, setExplanation] = useState<AdaptiveExplanationView | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setIsLoadingProfile(true);
        setError("");
        getLearningProfile(studyAreaId)
            .then(setProfile)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoadingProfile(false));
    }, [studyAreaId]);

    async function handleProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSavingProfile(true);
        const form = new FormData(event.currentTarget);
        const difficulties = String(form.get("difficulties") ?? "")
            .split("\n")
            .map((difficulty) => difficulty.trim())
            .filter(Boolean);

        try {
            const updated = await updateLearningProfile(studyAreaId, {
                pace: String(form.get("pace") ?? "BALANCED") as LearningProfileView["pace"],
                level: String(form.get("level") ?? "BEGINNER") as LearningProfileView["level"],
                difficulties,
                preferredExplanationStyle: String(form.get("preferredExplanationStyle") ?? ""),
            });

            setProfile(updated);
            setNotice("Perfil adaptativo guardado.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar o perfil.");
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function handleQuestion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsGenerating(true);
        const form = new FormData(event.currentTarget);

        try {
            setExplanation(await askAdaptiveExplanation(studyAreaId, String(form.get("topic") ?? "")));
            setNotice("Explicação gerada com fontes autorizadas.");
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível gerar explicação.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <main>
            <h1>Explicações adaptadas</h1>
            {isLoadingProfile ? <p>A carregar perfil adaptativo.</p> : null}
            <form key={profile?.id ?? "new-profile"} onSubmit={handleProfile}>
                <select name="pace" defaultValue={profile?.pace ?? "BALANCED"}>
                    <option value="SLOW">Devagar</option>
                    <option value="BALANCED">Equilibrado</option>
                    <option value="FAST">Rápido</option>
                </select>
                <select name="level" defaultValue={profile?.level ?? "BEGINNER"}>
                    <option value="BEGINNER">Inicial</option>
                    <option value="INTERMEDIATE">Intermédio</option>
                    <option value="ADVANCED">Avançado</option>
                </select>
                <textarea name="difficulties" defaultValue={profile?.difficulties.join("\n") ?? ""} />
                <input
                    name="preferredExplanationStyle"
                    defaultValue={profile?.preferredExplanationStyle ?? ""}
                    placeholder="Estilo preferido"
                />
                <button type="submit" disabled={isSavingProfile || isLoadingProfile}>
                    {isSavingProfile ? "A guardar" : "Guardar perfil"}
                </button>
            </form>

            <form onSubmit={handleQuestion}>
                <input name="topic" placeholder="Tópico" required />
                <button type="submit" disabled={isGenerating}>
                    {isGenerating ? "A gerar" : "Gerar explicação"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {!isGenerating && !explanation ? <p>Ainda não há explicação gerada.</p> : null}

            {explanation ? (
                <section>
                    <p>{explanation.answer}</p>
                    <h2>Fontes</h2>
                    <ul>
                        {explanation.sources.map((source) => (
                            <li key={source.materialId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}