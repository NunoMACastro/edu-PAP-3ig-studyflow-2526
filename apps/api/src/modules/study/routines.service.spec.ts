import { Types } from "mongoose";
import { RoutinesService } from "./routines.service.js";

describe("RoutinesService", () => {
    const userId = "507f1f77bcf86cd799439012";
    const routineId = "507f1f77bcf86cd799439013";
    const goalId = "507f1f77bcf86cd799439014";

    /**
     * Confirma que as listagens só devolvem dados ativos do utilizador.
     */
    it("lista rotinas e objetivos filtrando ownership e arquivo lógico", async () => {
        const routineLean = jest.fn().mockResolvedValue([]);
        const goalLean = jest.fn().mockResolvedValue([]);
        const routineSort = jest.fn().mockReturnValue({ lean: routineLean });
        const goalSort = jest.fn().mockReturnValue({ lean: goalLean });
        const routineModel = {
            find: jest.fn().mockReturnValue({ sort: routineSort }),
        };
        const goalModel = {
            find: jest.fn().mockReturnValue({ sort: goalSort }),
        };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            { recordEvent: jest.fn() } as never,
        );

        await service.listMine(userId);

        expect(routineModel.find).toHaveBeenCalledWith({
            userId: expect.any(Types.ObjectId),
            archived: false,
        });
        expect(goalModel.find).toHaveBeenCalledWith({
            userId: expect.any(Types.ObjectId),
            archived: false,
        });
    });

    /**
     * Confirma que arquivar uma rotina usa ownership e regista histórico.
     */
    it("arquiva rotina do utilizador autenticado", async () => {
        const routineModel = {
            findOneAndUpdate: jest.fn().mockResolvedValue({ title: "Estudo" }),
        };
        const goalModel = {};
        const historyService = { recordEvent: jest.fn() };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            historyService as never,
        );

        await expect(service.archiveRoutine(userId, routineId)).resolves.toEqual({
            ok: true,
        });
        expect(routineModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: routineId,
                userId: expect.any(Types.ObjectId),
                archived: false,
            },
            { $set: { archived: true } },
            { new: true },
        );
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "ROUTINE_ARCHIVED",
            "Rotina arquivada",
            "Estudo",
        );
    });

    /**
     * Confirma que atualizar objetivos respeita ownership e histórico.
     */
    it("atualiza objetivo do utilizador autenticado", async () => {
        const routineModel = {};
        const goalModel = {
            findOneAndUpdate: jest.fn().mockResolvedValue({ title: "Meta" }),
        };
        const historyService = { recordEvent: jest.fn() };
        const service = new RoutinesService(
            routineModel as never,
            goalModel as never,
            historyService as never,
        );

        await service.updateGoal(userId, goalId, { completed: true });

        expect(goalModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: goalId,
                userId: expect.any(Types.ObjectId),
                archived: false,
            },
            { $set: { completed: true } },
            { new: true, runValidators: true },
        );
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "GOAL_UPDATED",
            "Objetivo atualizado",
            "Meta",
        );
    });
});
