import { FormEvent, useEffect, useState } from "react";
import {
    StudyRoomView,
    addRoomMember,
    createStudyRoom,
    listStudyRooms,
} from "../../lib/api/studyRooms";

export function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoomView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setRooms(await listStudyRooms());
    }

    useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, []);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");
        setIsSaving(true);
        const form = new FormData(event.currentTarget);

        try {
            await createStudyRoom({
                name: String(form.get("name") ?? ""),
                type: String(form.get("type") ?? "FREE") as "FREE" | "SUBJECT",
                disciplineName: String(form.get("disciplineName") ?? "") || undefined,
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Sala criada com sucesso.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a sala.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleInvite(roomId: string, email: string) {
        setError("");
        setNotice("");
        await addRoomMember(roomId, email);
        await refresh();
        setNotice("Membro adicionado à sala.");
    }

    return (
        <main>
            <h1>Salas de estudo</h1>
            <form onSubmit={handleCreate}>
                <input name="name" placeholder="Nome da sala" required />
                <select name="type">
                    <option value="FREE">Livre</option>
                    <option value="SUBJECT">Disciplina</option>
                </select>
                <input name="disciplineName" placeholder="Nome da disciplina" />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A criar" : "Criar sala"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar salas.</p> : null}
            {!isLoading && rooms.length === 0 ? <p>Ainda não tens salas de estudo.</p> : null}

            {rooms.map((room) => (
                <article key={room.id}>
                    <h2>{room.name}</h2>
                    <p>{room.type} · {room.memberIds.length} membros</p>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            const form = new FormData(event.currentTarget);
                            handleInvite(room.id, String(form.get("email") ?? "")).catch(
                                (reason: Error) => setError(reason.message),
                            );
                            event.currentTarget.reset();
                        }}
                    >
                        <input name="email" type="email" placeholder="Email do colega" required />
                        <button type="submit">Adicionar</button>
                    </form>
                </article>
            ))}
        </main>
    );
}