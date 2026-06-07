import { AiArtifactType } from "../schemas/ai-artifact.schema.js";

export type AiArtifactSourceDto = {
    materialId?: string;
    title?: string;
    page?: number;
    section?: string;
};

export type AiArtifactDto = {
    _id: string;
    studyAreaId: string;
    type: AiArtifactType;
    contentJson: Record<string, unknown>;
    sourcesJson: AiArtifactSourceDto[];
    createdAt?: Date;
    updatedAt?: Date;
};

type ArtifactLike = {
    _id: unknown;
    studyAreaId: unknown;
    type: AiArtifactType;
    contentJson: Record<string, unknown>;
    sourcesJson?: AiArtifactSourceDto[];
    createdAt?: Date;
    updatedAt?: Date;
    toObject?: () => ArtifactLike;
};

/**
 * Converte um artefacto IA no contrato público herdável da MF0.
 *
 * @param artifact Documento Mongoose ou objeto lean.
 * @returns Artefacto sem `userId` nem campos internos Mongo.
 */
export function toAiArtifactDto(artifact: ArtifactLike): AiArtifactDto {
    const value = normalizeDocument(artifact);
    return {
        _id: String(value._id),
        studyAreaId: String(value.studyAreaId),
        type: value.type,
        contentJson: value.contentJson,
        sourcesJson: value.sourcesJson ?? [],
        ...(value.createdAt ? { createdAt: value.createdAt } : {}),
        ...(value.updatedAt ? { updatedAt: value.updatedAt } : {}),
    };
}

/**
 * Usa `toObject` quando existe para lidar com documentos Mongoose.
 *
 * @param value Documento ou objeto já serializado.
 * @returns Objeto serializável.
 */
function normalizeDocument<T extends { toObject?: () => T }>(value: T): T {
    return typeof value.toObject === "function" ? value.toObject() : value;
}
