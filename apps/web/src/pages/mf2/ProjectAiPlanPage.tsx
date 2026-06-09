// apps/web/src/pages/mf2/ProjectAiPlanPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createProjectAiPlan, listProjectAiPlans, ProjectAiPlanView } from "../../lib/api/project-ai";

export function ProjectAiPlanPage() {
    const [classId, setClassId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [objective, setObjective] = useState("");
    const [plans, setPlans] = useState<ProjectAiPlanView[]>([]);
    const [error, setError] = useState("");

    async function load() {
        if (!classId.trim() || !projectId.trim()) return;
        try { setPlans(await listProjectAiPlans(classId.trim(), projectId.trim())); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar planos."); }
    }

    useEffect(() => {
        void load();
    }, [classId, projectId]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        await createProjectAiPlan(classId.trim(), projectId.trim(), { objective });
        setObjective("");
        await load();
    }

    return (
        <main>
            <h1>Plano gradual de projeto</h1>
            <form onSubmit={submit}>
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="ID do projeto" />
                <textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="Objetivo" />
                <button type="submit">Gerar plano</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {plans.map((plan) => (
                    <li key={plan.id}>
                        {plan.objective}
                        <ol>
                            {plan.steps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                    </li>
                ))}
            </ul>
        </main>
    );
}