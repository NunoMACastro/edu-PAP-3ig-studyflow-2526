import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";

const studyAreaId = "507f1f77bcf86cd799439014";
const materialId = "507f1f77bcf86cd799439015";

describe("AdaptiveLearningService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("não chama a IA quando a área não tem materiais READY com texto", async () => {
        const { aiProvider, explanationModel, materialsService, service } =
            makeService();
        materialsService.listReadyTextSources.mockResolvedValue([]);

        await expect(
            service.askAdaptiveExplanation(student.id, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateAdaptiveExplanation).not.toHaveBeenCalled();
        expect(explanationModel.create).not.toHaveBeenCalled();
    });

    it("devolve 503 quando o provider devolve fontes fora dos materiais autorizados", async () => {
        const { aiProvider, explanationModel, historyService, service } =
            makeService();
        aiProvider.generateAdaptiveExplanation.mockResolvedValue({
            answer: "Uma função relaciona valores.",
            suggestedNextSteps: ["Rever exemplos."],
            sourceMaterialIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.askAdaptiveExplanation(student.id, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(explanationModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });
});

function makeService() {
    const profileModel = {
        findOne: jest.fn().mockReturnValue(leanResult(null)),
        findOneAndUpdate: jest.fn(),
    };
    const explanationModel = {
        create: jest.fn(),
    };
    const aiProvider = {
        generateAdaptiveExplanation: jest.fn(),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: materialId,
                title: "Funções",
                contentText: "Uma função associa elementos de dois conjuntos.",
            },
        ]),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };
    const service = new AdaptiveLearningService(
        profileModel as never,
        explanationModel as never,
        aiProvider as never,
        materialsService as never,
        areasService as never,
        historyService as never,
    );
    return {
        aiProvider,
        areasService,
        explanationModel,
        historyService,
        materialsService,
        profileModel,
        service,
    };
}

function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}
