// apps/web/src/pages/student/RoomSharesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { RoomShareView, createRoomShare, listRoomShares } from "../../lib/api/roomShares";

type Props = {
    roomId: string;
};

export function RoomSharesPage({ roomId }: Props) {
    const [shares, setShares] = useState<RoomShareView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setShares(await listRoomShares(roomId));
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [roomId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);

        const form = new FormData(event.currentTarget);

        try {
            await createRoomShare(roomId, {
                type: String(form.get("type") ?? "NOTE") as "NOTE" | "URL" | "MATERIAL_REF",
                title: String(form.get("title") ?? ""),
                textContent: String(form.get("textContent") ?? ""),
                sourceUrl: String(form.get("sourceUrl") ?? ""),
                materialId: String(form.get("materialId") ?? ""),
                copiedText: String(form.get("copiedText") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Partilha criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível partilhar.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Partilhas da sala</h1>
            <form onSubmit={handleSubmit}>
                <select name="type">
                    <option value="NOTE">Apontamento</option>
                    <option value="URL">URL</option>
                    <option value="MATERIAL_REF">Material</option>
                </select>
                <input name="title" placeholder="Título" required />
                <textarea name="textContent" placeholder="Texto do apontamento" />
                <input name="sourceUrl" type="url" placeholder="URL" />
                <input name="materialId" placeholder="ID do material" />
                <textarea name="copiedText" placeholder="Texto copiado da URL para a IA" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A partilhar" : "Partilhar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar partilhas.</p> : null}
            {!isLoading && shares.length === 0 ? <p>Ainda não existem partilhas nesta sala.</p> : null}
            {shares.map((share) => (
                <article key={share.id}>
                    <h2>{share.title}</h2>
                    <p>{share.type} · {share.usableByAi ? "Fonte de IA" : "Referência"}</p>
                </article>
            ))}
        </main>
    );
}