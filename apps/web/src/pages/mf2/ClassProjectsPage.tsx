// apps/web/src/pages/mf2/ClassProjectsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createClassProject, listClassProjects, publishClassProject, ClassProjectView } from "../../lib/api/class-projects";

export function ClassProjectsPage() {
    const [classId, setClassId] = useState("");
    const [title, setTitle] = useState("");
    const [brief, setBrief] = useState("");
    const [projects, setProjects] = useState<ClassProjectView[]>([]);
    const [error, setError] = useState("");

    async function load() {
        if (!classId.trim()) return;
        try { setProjects(await listClassProjects(classId.trim())); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar projetos."); }
    }

    useEffect(() => {
        void load();
    }, [classId]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        await createClassProject(classId.trim(), { title, brief });
        setTitle("");
        setBrief("");
        await load();
    }

    return (
        <main>
            <h1>Projetos da turma</h1>
            <form onSubmit={submit}>
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Enunciado" />
                <button type="submit">Criar projeto</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        {project.title} - {project.status}
                        <button type="button" onClick={() => publishClassProject(classId, project.id).then(load)}>
                            Publicar
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}