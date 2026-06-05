// apps/web/src/pages/student/StudentClassAiPage.tsx
import { FormEvent, useState } from "react";
import { ClassAiAnswer, askClassAi } from "../../lib/api/classAi";

type Props = {
    subjectId: string;
};

export function StudentClassAiPage({ subjectId }: Props) {
    const [answer, setAnswer] = useState<ClassAiAnswer | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsLoading(true);

        const form = new FormData(event.currentTarget);

        try {
            setAnswer(await askClassAi(subjectId, String(form.get("question") ?? "")));
            setNotice("Resposta gerada com materiais oficiais.");
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível obter resposta.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <h1>IA da disciplina</h1>
            <form onSubmit={handleSubmit}>
                <textarea name="question" minLength={10} required />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "A responder" : "Perguntar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {!isLoading && !answer ? <p>Ainda não há resposta gerada nesta sessão.</p> : null}
            {answer ? (
                <section>
                    <p>{answer.answer}</p>
                    <h2>Fontes usadas</h2>
                    <ul>
                        {answer.sources.map((source) => (
                            <li key={source.materialId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}