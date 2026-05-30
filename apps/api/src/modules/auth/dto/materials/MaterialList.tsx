import { Material } from "../../lib/apiClient";

export function MaterialList({ materials }: { materials: Material[] }) {
    if (materials.length === 0)
        return <p>Ainda não há materiais nesta área.</p>;

    return (
        <ul className="space-y-3">
            {materials.map((material) => (
                <li className="rounded border bg-white p-4" key={material._id}>
                    <strong>{material.title}</strong>
                    <p>
                        {material.type} ·{" "}
                        {material.status === "READY"
                            ? "Pronto"
                            : "Pendente de processamento"}
                    </p>
                </li>
            ))}
        </ul>
    );
}