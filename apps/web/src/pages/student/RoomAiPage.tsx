// apps/web/src/pages/student/RoomAiPage.tsx
import { FormEvent, useState } from "react";
import { RoomAiAnswer, askRoomAi } from "../../lib/api/roomAi";

type Props = {
    roomId: string;
};

export function RoomAiPage({ roomId }: Props) {
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
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
            setAnswer(await askRoomAi(roomId, { question: String(form.get("question") ?? "") }));
            setNotice("Resposta gerada com fontes da sala.");
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível obter resposta.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <h1>IA da sala</h1>
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
                    <h2>Fontes da sala</h2>
                    <ul>
                        {answer.sources.map((source) => (
                            <li key={source.shareId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}