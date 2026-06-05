import { StudyMaterial } from "../../lib/api/apiClient.js";

type MaterialListProps = {
    materials: StudyMaterial[];
};

/**
 * Lista materiais submetidos numa área.
 *
 * @param props Materiais carregados da API.
 * @returns Lista visual com estado de processamento.
 */
export function MaterialList({ materials }: MaterialListProps) {
    if (materials.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há materiais.</p>;
    }

    return (
        <ul className="space-y-3">
            {materials.map((material) => (
                <li className="rounded-md border border-slate-200 bg-white p-4" key={material._id}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold">{material.title}</p>
                            <p className="text-sm text-slate-600">{material.type}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {material.status}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
