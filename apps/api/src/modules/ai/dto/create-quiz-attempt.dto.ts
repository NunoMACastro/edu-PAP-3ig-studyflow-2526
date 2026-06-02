import { Allow } from "class-validator";

/**
 * Respostas escolhidas pelo aluno num quiz gerado pela IA.
 */
export class CreateQuizAttemptDto {
    @Allow()
    answers!: number[];
}
