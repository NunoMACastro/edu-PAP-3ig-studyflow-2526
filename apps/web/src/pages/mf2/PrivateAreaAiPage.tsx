// apps/web/src/pages/mf2/PrivateAreaAiPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { askPrivateAreaAi, listPrivateAreaAiAnswers, PrivateAreaAiAnswerView } from "../../lib/api/private-area-ai";

export function PrivateAreaAiPage() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<PrivateAreaAiAnswerView[]>([]);
    const [error, setError] = useState("");
    async function load() {
        if (!studyAreaId.trim()) return;

        try {
            setAnswers(await listPrivateAreaAiAnswers(studyAreaId.trim()));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar IA privada.");
        }
    }
    useEffect(() => {
        void load();
    }, [studyAreaId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        await askPrivateAreaAi(studyAreaId.trim(), question);
        setQuestion("");
        await load();
    }
    return (
        <main>
            <h1>IA privada da área</h1>
            <form onSubmit={submit}>
                <input value={studyAreaId} onChange={(event) => setStudyAreaId(event.target.value)} placeholder="ID da área" />
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