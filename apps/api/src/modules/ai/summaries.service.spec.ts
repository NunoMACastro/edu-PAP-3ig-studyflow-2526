import { UnprocessableEntityException } from "@nestjs/common";
import { SummariesService } from "./summaries.service.js";

describe("SummariesService", () => {
    /**
     * Confirma que a geração não chama a IA sem fontes processáveis.
     */
    it("bloqueia geração de resumo sem fontes processáveis", async () => {
        const artifactModel = { create: jest.fn() };
        const aiProvider = { generateSummary: jest.fn() };
        const materialsService = {
            listReadyTextSources: jest.fn().mockResolvedValue([]),
        };
        const areasService = {
            getMyStudyArea: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                name: "Matemática",
            }),
        };
        const profileService = {
            prepareProfile: jest.fn().mockResolvedValue({
                status: "READY_FOR_GENERATION",
                voiceTone: "directo",
            }),
        };
        const historyService = { recordEvent: jest.fn() };

        const service = new SummariesService(
            artifactModel as never,
            aiProvider as never,
            materialsService as never,
            areasService as never,
            profileService as never,
            historyService as never,
        );

        await expect(
            service.generateSummary(
                "507f1f77bcf86cd799439012",
                "507f1f77bcf86cd799439011",
            ),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateSummary).not.toHaveBeenCalled();
        expect(artifactModel.create).not.toHaveBeenCalled();
    });
});
