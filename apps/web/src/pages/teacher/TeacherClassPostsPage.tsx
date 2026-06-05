// apps/web/src/pages/teacher/TeacherClassPostsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    ClassPostView,
    createClassPost,
    listTeacherClassPosts,
} from "../../lib/api/classPosts";

type Props = {
    classId: string;
};

export function TeacherClassPostsPage({ classId }: Props) {
    const [posts, setPosts] = useState<ClassPostView[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setPosts(await listTeacherClassPosts(classId));
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
            await createClassPost(classId, {
                type: String(form.get("type") ?? "NOTICE") as "NOTICE" | "POST",
                title: String(form.get("title") ?? ""),
                body: String(form.get("body") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
            setNotice("Publicação enviada.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível publicar.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main>
            <h1>Publicações da turma</h1>
            <form onSubmit={handleSubmit}>
                <select name="type">
                    <option value="NOTICE">Aviso</option>
                    <option value="POST">Publicação</option>
                </select>
                <input name="title" placeholder="Título" required />
                <textarea name="body" required />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A publicar" : "Publicar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {notice ? <p role="status">{notice}</p> : null}
            {isLoading ? <p>A carregar publicações.</p> : null}
            {!isLoading && posts.length === 0 ? <p>Ainda não existem publicações nesta turma.</p> : null}
            {posts.map((post) => (
                <article key={post.id}>
                    <strong>{post.type}</strong>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                </article>
            ))}
        </main>
    );
}