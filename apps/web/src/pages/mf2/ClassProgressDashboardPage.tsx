// apps/web/src/pages/mf2/ClassProgressDashboardPage.tsx
import { useEffect, useState } from "react";
import { getClassProgressDashboard, ClassProgressDashboard } from "../../lib/api/class-progress";

export function ClassProgressDashboardPage() {
    const [classId, setClassId] = useState("");
    const [dashboard, setDashboard] = useState<ClassProgressDashboard | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        if (!classId.trim()) return;

        getClassProgressDashboard(classId.trim())
            .then(setDashboard)
            .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar painel."));
    }, [classId]);
    return (
        <main>
            <h1>Painel da turma</h1>
            <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
            {error && <p role="alert">{error}</p>}
            {dashboard && (
                <section>
                    <p>Publicações: {dashboard.postCount}</p>
                    <p>Notas: {dashboard.noteCount}</p>
                    <p>Dificuldades: {dashboard.difficultyTags.join(", ") || "Sem dados"}</p>
                </section>
            )}
        </main>
    );
}