import {
    BadGatewayException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import OpenAI from "openai";
import { StudyToolType } from "../dto/create-study-tool.dto.js";

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

/**
 * Contrato isolado do provider de IA.
 *
 * Os services de domínio conhecem este contrato, não o SDK da OpenAI. Assim, em
 * testes ou fases futuras, o provider pode ser substituído sem alterar regras
 * de ownership, fontes ou validação.
 */
export interface AiProvider {
    generateSummary(input: { prompt: string }): Promise<SummaryResult>;
    generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>>;
}

/**
 * Provider OpenAI usado quando `OPENAI_API_KEY` e `OPENAI_MODEL` existem.
 */
@Injectable()
export class OpenAiProvider implements AiProvider {
    /**
     * Gera resumo em JSON.
     *
     * @param input Prompt final já construído pelo service.
     * @returns Resumo parseado.
     */
    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        return this.createJsonResponse<SummaryResult>(input.prompt);
    }

    /**
     * Gera ferramenta de estudo em JSON.
     *
     * @param input Prompt final e tipo pedido.
     * @returns JSON parseado com a estrutura solicitada.
     */
    async generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>> {
        return this.createJsonResponse<Record<string, unknown>>(input.prompt);
    }

    /**
     * Chama a Responses API e valida que a resposta é JSON.
     *
     * @param prompt Prompt final.
     * @returns JSON parseado no tipo pedido pelo chamador.
     */
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
