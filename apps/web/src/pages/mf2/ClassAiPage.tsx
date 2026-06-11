// apps/web/src/pages/mf2/ClassAiPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { askClassAi, listClassAiAnswers, ClassAiAnswerView } from "../../lib/api/class-ai";

export function ClassAiPage() {
    const [subjectId, setSubjectId] = useState("");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<ClassAiAnswerView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!subjectId.trim()) return;

        try {
            setAnswers(await listClassAiAnswers(subjectId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar IA da disciplina.");
        }
    }
    useEffect(() => {
        void load();
    }, [subjectId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await askClassAi(subjectId.trim(), question);
        setQuestion("");
        await load();
    }
    return (
        <main>
            <h1>IA da disciplina</h1>
            <form onSubmit={submit}>
                <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} placeholder="ID da disciplina" />
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pergunta" />
                <button type="submit">Perguntar</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <ul>
                {answers.map((answer) => (
                    <li key={answer.id}>
                        {answer.question}
                        <p>{answer.answer}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}