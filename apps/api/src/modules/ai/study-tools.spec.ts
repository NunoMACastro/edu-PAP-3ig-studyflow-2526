import { UnprocessableEntityException } from "@nestjs/common";
import { StudyToolsService } from "./study-tools.service";

describe("StudyToolsService", () => {
    it("bloqueia geração quando não há fontes processáveis", async () => {
        const service = new StudyToolsService(
            { create: jest.fn(), find: jest.fn() } as any,
            { generateStudyTool: jest.fn() } as any,
            { listByArea: jest.fn().mockResolvedValue([]) } as any,
            {
                getMyStudyArea: jest
                    .fn()
                    .mockResolvedValue({ name: "Matemática" }),
            } as any,
            {
                prepareProfile: jest
                    .fn()
                    .mockResolvedValue({ status: "READY_FOR_GENERATION" }),
            } as any,
        );

        await expect(
            service.generateStudyTool("user-1", "area-1", { type: "QUIZ" }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
});