import { Injectable, ServiceUnavailableException } from "@nestjs/common";
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

export const AI_PROVIDER = Symbol("AI_PROVIDER");

export interface AiProvider {
    generateSummary(input: { prompt: string }): Promise<SummaryResult>;
}

@Injectable()
export class OpenAiProvider implements AiProvider {
    private readonly client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_NOT_CONFIGURED",
                message: "O serviço de IA ainda não está configurado.",
            });
        }

        const response = await this.client.responses.create({
            model: process.env.OPENAI_MODEL,
            input: input.prompt,
        });

        // A Responses API expõe output_text no SDK oficial de JavaScript.
        return JSON.parse(response.output_text ?? "{}") as SummaryResult;
    }
}