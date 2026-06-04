// apps/api/src/modules/ai/providers/ai-provider.ts
import {
    BadGatewayException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import OpenAI from "openai";

export type AiSource = {
    materialId: string;
    title: string;
    contentText: string;
};

export type SummaryResult = {
    title: string;
    bullets: string[];
    sourceMaterialIds: string[];
};

export type AdaptiveExplanationResult = {
    answer: string;
    sourceMaterialIds: string[];
    adaptationNotes: string[];
};

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export const AI_PROVIDER = Symbol("AI_PROVIDER");

export interface AiProvider {
    generateSummary(input: { prompt: string }): Promise<SummaryResult>;
    generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult>;
    generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>>;
}

@Injectable()
export class OpenAiProvider implements AiProvider {
    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        return this.createJsonResponse<SummaryResult>(input.prompt);
    }

    async generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult> {
        return this.createJsonResponse<AdaptiveExplanationResult>(input.prompt);
    }

    async generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>> {
        return this.createJsonResponse<Record<string, unknown>>(input.prompt);
    }

    private async createJsonResponse<T>(prompt: string): Promise<T> {
        const apiKey = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL;

        if (!apiKey || !model) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_NOT_CONFIGURED",
                message: "O serviço de IA ainda não está configurado.",
            });
        }

        const client = new OpenAI({ apiKey });
        const response = await client.responses.create({
            model,
            input: prompt,
        });

        try {
            return JSON.parse(response.output_text ?? "{}") as T;
        } catch {
            throw new BadGatewayException({
                code: "AI_PROVIDER_INVALID_JSON",
                message: "A IA devolveu uma resposta inválida.",
            });
        }
    }
}