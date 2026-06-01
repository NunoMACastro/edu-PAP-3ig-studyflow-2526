import { BadGatewayException } from "@nestjs/common";

type QuizQuestion = {
    question?: unknown;
    options?: unknown;
    correctOptionIndex?: unknown;
    explanation?: unknown;
    sourceMaterialIds?: unknown;
};

export function validateQuizArtifact(content: Record<string, unknown>): void {
    const questions = content.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
        rejectInvalidQuiz("QUIZ_WITHOUT_QUESTIONS");
    }

    for (const rawQuestion of questions as QuizQuestion[]) {
        if (
            typeof rawQuestion.question !== "string" ||
            rawQuestion.question.trim().length === 0
        ) {
            rejectInvalidQuiz("QUIZ_QUESTION_REQUIRED");
        }

        if (
            !Array.isArray(rawQuestion.options) ||
            rawQuestion.options.length !== 4
        ) {
            rejectInvalidQuiz("INVALID_QUIZ_OPTIONS");
        }

        if (
            !rawQuestion.options.every(
                (option) =>
                    typeof option === "string" && option.trim().length > 0,
            )
        ) {
            rejectInvalidQuiz("INVALID_QUIZ_OPTION_TEXT");
        }

        if (
            !Number.isInteger(rawQuestion.correctOptionIndex) ||
            rawQuestion.correctOptionIndex < 0 ||
            rawQuestion.correctOptionIndex > 3
        ) {
            rejectInvalidQuiz("INVALID_CORRECT_OPTION_INDEX");
        }

        if (
            typeof rawQuestion.explanation !== "string" ||
            rawQuestion.explanation.trim().length === 0
        ) {
            rejectInvalidQuiz("QUIZ_EXPLANATION_REQUIRED");
        }

        if (
            !Array.isArray(rawQuestion.sourceMaterialIds) ||
            rawQuestion.sourceMaterialIds.length === 0
        ) {
            rejectInvalidQuiz("QUIZ_SOURCE_REQUIRED");
        }
    }
}

function rejectInvalidQuiz(code: string): never {
    throw new BadGatewayException({
        code,
        message: "A IA devolveu um quiz com formato inválido. Tenta novamente.",
    });
}