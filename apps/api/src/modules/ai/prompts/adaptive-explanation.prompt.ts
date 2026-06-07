import { AiSource } from "../providers/ai-provider.js";
import {
    LearningLevel,
    LearningPace,
} from "../schemas/learning-profile.schema.js";

type BuildAdaptiveExplanationPromptInput = {
    areaName: string;
    question: string;
    pace: LearningPace;
    level: LearningLevel;
    difficultyNotes?: string;
    sources: AiSource[];
};

/**
 * Constrói o prompt para uma explicação adaptada ao perfil do aluno.
 *
 * @param input Contexto validado pelo backend.
 * @returns Prompt com contrato JSON explícito.
 */
export function buildAdaptiveExplanationPrompt(
    input: BuildAdaptiveExplanationPromptInput,
): string {
    const sources = input.sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    return [
        "És um assistente pedagógico da StudyFlow em português de Portugal.",
        "Responde apenas com base nas fontes autorizadas abaixo.",
        "Adapta a explicação ao perfil do aluno, sem inventar factos fora das fontes.",
        `Área de estudo: ${input.areaName}`,
        `Ritmo: ${input.pace}`,
        `Nível: ${input.level}`,
        `Dificuldades declaradas: ${input.difficultyNotes?.trim() || "Não indicadas"}`,
        `Pergunta do aluno: ${input.question}`,
        "Fontes autorizadas:",
        sources,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","suggestedNextSteps":["passo 1"],"sourceMaterialIds":["id"]}`,
    ].join("\n\n");
}
