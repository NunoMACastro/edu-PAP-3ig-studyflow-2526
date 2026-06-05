// apps/web/src/pages/teacher/TeacherSubjectsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { SubjectView, createSubject, listSubjects } from "../../lib/api/subjects";

type Props = {
    classId: string;
};

export function TeacherSubjectsPage({ classId }: Props) {
    const [subjects, setSubjects] = useState<SubjectView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setSubjects(await listSubjects(classId));
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [classId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);

        try {
            await createSubject(classId, {
                name: String(form.get("name") ?? ""),
                code: String(form.get("code") ?? ""),
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Disciplina criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a disciplina.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Disciplinas da turma</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Nome da disciplina" required />
                <input name="code" placeholder="Código curto" />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A criar" : "Criar disciplina"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}

            <section>
                {isLoading ? <p>A carregar disciplinas.</p> : null}
                {!isLoading && subjects.length === 0 ? <p>Ainda não existem disciplinas nesta turma.</p> : null}
                {subjects.map((subject) => (
                    <article key={subject.id}>
                        <h2>{subject.name}</h2>
                        <p>{subject.code}</p>
                        <p>{subject.description}</p>
                    </article>
                ))}
            </section>
        </main>
    );
}