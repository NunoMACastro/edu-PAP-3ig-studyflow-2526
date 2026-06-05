import { useEffect, useState } from "react";
import { SchoolClassView, listStudentClasses } from "../../lib/api/classes";

export function StudentClassesPage() {
    const [classes, setClasses] = useState<SchoolClassView[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        listStudentClasses()
            .then(setClasses)
            .catch((reason: Error) => setError(reason.message))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <main>
            <h1>As minhas turmas</h1>
            {error ? <p role="alert">{error}</p> : null}
            {isLoading ? <p>A carregar turmas.</p> : null}
            {!isLoading && classes.length === 0 ? <p>Ainda não estás inscrito em turmas.</p> : null}
            {classes.map((schoolClass) => (
                <article key={schoolClass.id}>
                    <h2>{schoolClass.name}</h2>
                    <p>{schoolClass.code} · {schoolClass.schoolYear}</p>
                </article>
            ))}
        </main>
    );
}