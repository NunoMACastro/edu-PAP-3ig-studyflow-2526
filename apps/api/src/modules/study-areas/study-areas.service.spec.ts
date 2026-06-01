import { BadRequestException, ConflictException } from "@nestjs/common";
import { StudyAreasService } from "./study-areas.service.js";

describe("StudyAreasService", () => {
    const userId = "507f1f77bcf86cd799439012";

    it("mapeia corrida de nome duplicado Mongo para 409 controlado", async () => {
        const areaModel = {
            exists: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockRejectedValue({ code: 11000 }),
        };
        const historyService = { recordEvent: jest.fn() };
        const service = new StudyAreasService(
            areaModel as never,
            historyService as never,
        );

        await expect(
            service.createStudyArea(userId, { name: "Matemática" }),
        ).rejects.toMatchObject({
            response: {
                code: "AREA_NAME_DUPLICATED",
            },
        });
        await expect(
            service.createStudyArea(userId, { name: "Matemática" }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });

    it("rejeita atualização com nome vazio", async () => {
        const areaModel = {
            findOneAndUpdate: jest.fn(),
        };
        const service = new StudyAreasService(
            areaModel as never,
            { recordEvent: jest.fn() } as never,
        );

        await expect(
            service.updateStudyArea(userId, "507f1f77bcf86cd799439013", {
                name: "   ",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(areaModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("mapeia nome duplicado em atualização para 409 controlado", async () => {
        const areaModel = {
            findOneAndUpdate: jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue({ code: 11000 }),
            }),
        };
        const service = new StudyAreasService(
            areaModel as never,
            { recordEvent: jest.fn() } as never,
        );

        await expect(
            service.updateStudyArea(userId, "507f1f77bcf86cd799439013", {
                name: "Matemática",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });
});
