import { FormEvent, useEffect, useState } from "react";
import {
    SchoolClassView,
    addClassStudent,
    createClass,
    listTeacherClasses,
} from "../../lib/api/classes";

export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClassView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, []);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setNotice("");

        const form = new FormData(event.currentTarget);

        try {
            await createClass({
                name: String(form.get("name") ?? ""),
                code: String(form.get("code") ?? ""),
                schoolYear: String(form.get("schoolYear") ?? ""),
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Turma criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a turma.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAddStudent(classId: string, email: string) {
        setError("");
        setNotice("");
        await addClassStudent(classId, email);
        await refresh();
        setNotice("Aluno adicionado à turma.");
    }

    return (
        <main>
            <h1>Turmas</h1>
            <form onSubmit={handleCreate}>
                <input name="name" placeholder="Nome da turma" required />
                <input name="code" placeholder="Código" required />
                <input name="schoolYear" placeholder="Ano letivo" required />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A guardar" : "Criar turma"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}

            <section>
                {isLoading ? <p>A carregar turmas.</p> : null}
                {!isLoading && classes.length === 0 ? <p>Ainda não existem turmas criadas.</p> : null}
                {classes.map((schoolClass) => (
                    <article key={schoolClass.id}>
                        <h2>{schoolClass.name}</h2>
                        <p>{schoolClass.code} · {schoolClass.schoolYear}</p>
                        <p>{schoolClass.studentIds.length} alunos inscritos</p>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                const form = new FormData(event.currentTarget);
                                handleAddStudent(schoolClass.id, String(form.get("email") ?? "")).catch(
                                    (reason: Error) => setError(reason.message),
                                );
                                event.currentTarget.reset();
                            }}
                        >
                            <input name="email" type="email" placeholder="Email do aluno" required />
                            <button type="submit">Adicionar aluno</button>
                        </form>
                    </article>
                ))}
            </section>
        </main>
    );
}