// apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts
import { OfficialMaterialDocument } from "../../official-materials/schemas/official-material.schema";
import { TeacherAiVoiceDocument } from "../../teacher-ai/schemas/teacher-ai-voice.schema";

type BuildClassAiPromptInput = {
    question: string;
    materials: OfficialMaterialDocument[];
    voice: TeacherAiVoiceDocument | null;
};

export function buildClassAiPrompt(input: BuildClassAiPromptInput) {
    const tone = input.voice?.tone ?? "CALM";
    const detailLevel = input.voice?.detailLevel ?? "BALANCED";
    const rules = input.voice?.rules ?? [];
    const sources = input.materials
        .map((material, index) => {
            return `Fonte ${index + 1}: ${material.title}\n${material.textContent ?? ""}`;
        })
        .join("\n\n");

    return [
        "Responde apenas com base nas fontes oficiais fornecidas.",
        "Se a pergunta não estiver coberta pelas fontes, diz que a disciplina ainda não tem material oficial suficiente.",
        `Tom docente: ${tone}.`,
        `Nível de detalhe: ${detailLevel}.`,
        rules.length > 0 ? `Regras do professor: ${rules.join(" | ")}` : "Sem regras adicionais do professor.",
        `Pergunta do aluno: ${input.question}`,
        sources,
        "Devolve JSON com as chaves answer e sourceMaterialIds.",
    ].join("\n\n");
}