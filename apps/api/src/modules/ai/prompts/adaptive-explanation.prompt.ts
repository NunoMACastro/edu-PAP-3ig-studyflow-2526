// apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts
import { MaterialDocument } from "../../materials/schemas/material.schema";
import { LearningProfileDocument } from "../schemas/learning-profile.schema";

type BuildAdaptivePromptInput = {
    topic: string;
    profile: LearningProfileDocument;
    materials: MaterialDocument[];
};

export function buildAdaptiveExplanationPrompt(input: BuildAdaptivePromptInput) {
    const sources = input.materials
        .map((material, index) => {
            return `Fonte ${index + 1}: ${material.title}\n${material.contentText ?? ""}`;
        })
        .join("\n\n");

    return [
        "Explica apenas com base nas fontes do aluno fornecidas.",
        "Adapta linguagem, ritmo e detalhe ao perfil, mas não acrescentes factos fora das fontes.",
        `Tópico pedido: ${input.topic}`,
        `Ritmo: ${input.profile.pace}`,
        `Nível: ${input.profile.level}`,
        `Dificuldades: ${input.profile.difficulties.join(" | ") || "sem dificuldades registadas"}`,
        `Estilo preferido: ${input.profile.preferredExplanationStyle ?? "claro e passo a passo"}`,
        sources,
        "Devolve JSON com answer, sourceMaterialIds e adaptationNotes.",
    ].join("\n\n");
}