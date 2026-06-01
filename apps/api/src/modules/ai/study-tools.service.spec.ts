import {
    BadGatewayException,
    BadRequestException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { StudyToolsService } from "./study-tools.service.js";

const userId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439011";

describe("StudyToolsService", () => {
    /**
     * Confirma a regra crítica da MF0: sem fontes processáveis não há IA.
     */
    it("bloqueia geração quando não há fontes processáveis", async () => {
        const { artifactModel, aiProvider, materialsService, service } =
            makeService();
        materialsService.listReadyTextSources.mockResolvedValue([]);

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "EXPLANATION",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "NO_PROCESSABLE_SOURCES",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "EXPLANATION",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(artifactModel.create).not.toHaveBeenCalled();
    });

    /**
     * Confirma que tipo inválido no body usa o erro canónico do BK-MF0-12.
     */
    it("rejeita tipo inválido na geração", async () => {
        const { aiProvider, areasService, service } = makeService();

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "NOT_A_TOOL" as never,
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_STUDY_TOOL_TYPE",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "NOT_A_TOOL" as never,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(areasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
    });

    /**
     * Confirma que tipo inválido em query não devolve lista vazia silenciosa.
     */
    it("rejeita tipo inválido na listagem", async () => {
        const { artifactModel, areasService, service } = makeService();

        await expect(
            service.listTools(userId, studyAreaId, "NOT_A_TOOL"),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_STUDY_TOOL_TYPE",
            },
        });
        await expect(
            service.listTools(userId, studyAreaId, "NOT_A_TOOL"),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(areasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(artifactModel.find).not.toHaveBeenCalled();
    });

    /**
     * Confirma que quizzes inválidos vindos do provider ficam em 502.
     */
    it("rejeita quiz inválido devolvido pelo provider", async () => {
        const { artifactModel, aiProvider, historyService, service } =
            makeService();
        aiProvider.generateStudyTool.mockResolvedValue({
            questions: [
                {
                    question: "Qual é a resposta?",
                    options: ["A", "B"],
                    correctOptionIndex: 0,
                    explanation: "Fonte insuficiente.",
                    sourceMaterialIds: ["507f1f77bcf86cd799439010"],
                },
            ],
        });

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "QUIZ",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_QUIZ_OPTIONS",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "QUIZ",
            }),
        ).rejects.toBeInstanceOf(BadGatewayException);
        expect(artifactModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });
});

/**
 * Cria o service com mocks isolados para testar regras MF0 sem Mongo/OpenAI.
 *
 * @returns Service e dependências mockadas.
 */
function makeService() {
    const artifactModel = {
        create: jest.fn(),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            }),
        }),
    };
    const aiProvider = {
        generateStudyTool: jest.fn(),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                title: "Fonte",
                contentText: "Conteúdo factual processável para a ferramenta.",
            },
        ]),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };
    const profileService = {
        prepareProfile: jest.fn().mockResolvedValue({
            status: "READY_FOR_GENERATION",
            voiceTone: "step_by_step",
        }),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };

    return {
        artifactModel,
        aiProvider,
        materialsService,
        areasService,
        profileService,
        historyService,
        service: new StudyToolsService(
            artifactModel as never,
            aiProvider as never,
            materialsService as never,
            areasService as never,
            profileService as never,
            historyService as never,
        ),
    };
}
