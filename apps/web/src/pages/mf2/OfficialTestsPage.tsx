// apps/web/src/pages/mf2/OfficialTestsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createOfficialTest, listOfficialTests, OfficialTestView } from "../../lib/api/official-tests";

export function OfficialTestsPage() {
    const [subjectId, setSubjectId] = useState("");
    const [title, setTitle] = useState("");
    const [tests, setTests] = useState<OfficialTestView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!subjectId.trim()) return;

        try {
            setTests(await listOfficialTests(subjectId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar testes.");
        }
    }
    useEffect(() => {
        void load();
    }, [subjectId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await createOfficialTest(subjectId.trim(), {
            title,
            type: "MINI_TEST",
            questions: [
                {
                    statement: "Pergunta inicial",
                    options: ["A", "B", "C", "D"],
                    correctAnswer: "A",
                },
            ],
        });
        setTitle("");
        await load();
    }
    return (
        <main>
            <h1>Testes oficiais</h1>
            <form onSubmit={submit}>
                <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} placeholder="ID da disciplina" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <button type="submit">Criar mini-teste</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {tests.map((test) => (
                    <li key={test.id}>{test.title} - {test.questionCount} perguntas</li>
                ))}
            </ul>
        </main>
    );
}