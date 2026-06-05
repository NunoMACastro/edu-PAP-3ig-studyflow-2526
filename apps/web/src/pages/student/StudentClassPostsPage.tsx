// apps/web/src/pages/student/StudentClassPostsPage.tsx
import { useEffect, useState } from "react";
import { ClassPostView, listClassPostsForStudent } from "../../lib/api/classPosts";

type Props = {
    classId: string;
};

export function StudentClassPostsPage({ classId }: Props) {
    const [posts, setPosts] = useState<ClassPostView[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        listClassPostsForStudent(classId)
            .then(setPosts)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, [classId]);

    return (
        <main>
            <h1>Avisos e publicações</h1>
            {error ? <p role="alert">{error}</p> : null}
            {isLoading ? <p>A carregar publicações.</p> : null}
            {!isLoading && posts.length === 0 ? <p>Ainda não existem publicações para esta turma.</p> : null}
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