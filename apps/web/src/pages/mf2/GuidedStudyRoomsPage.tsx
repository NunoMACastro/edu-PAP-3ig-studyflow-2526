// apps/web/src/pages/mf2/GuidedStudyRoomsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createGuidedStudyRoom, listTeacherGuidedStudyRooms, GuidedStudyRoomView } from "../../lib/api/guided-study-rooms";

export function GuidedStudyRoomsPage() {
    const [classId, setClassId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rooms, setRooms] = useState<GuidedStudyRoomView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        if (!classId.trim()) return;
        setLoading(true);
        setError("");
        try {
            setRooms(await listTeacherGuidedStudyRooms(classId.trim()));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar salas guiadas.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [classId]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        await createGuidedStudyRoom(classId.trim(), { title, description });
        setTitle("");
        setDescription("");
        await load();
    }

    return (
        <main>
            <h1>Salas de estudo guiado</h1>
            <form onSubmit={submit}>
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />
                <button type="submit">Criar sala</button>
            </form>
            {loading && <p>A carregar...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && rooms.length === 0 && <p>Sem salas guiadas.</p>}
            <ul>
                {rooms.map((room) => (
                    <li key={room.id}>{room.title} - {room.status}</li>
                ))}
            </ul>
        </main>
    );
}