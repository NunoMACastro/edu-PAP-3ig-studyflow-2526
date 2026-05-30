import { useEffect, useState } from "react";
import { MaterialList } from "../../components/materials/MaterialList";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm";
import { listMaterials, Material } from "../../lib/apiClient";

export function StudyAreaMaterialsPage({
    studyAreaId,
}: {
    studyAreaId: string;
}) {
    const [materials, setMaterials] = useState<Material[]>([]);

    useEffect(() => {
        listMaterials(studyAreaId).then(setMaterials);
    }, [studyAreaId]);

    return (
        <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            <h1 className="text-2xl font-semibold">Materiais da área</h1>
            <MaterialSubmitForm
                studyAreaId={studyAreaId}
                onCreated={(material) =>
                    setMaterials((current) => [material, ...current])
                }
            />
            <MaterialList materials={materials} />
        </main>
    );
}