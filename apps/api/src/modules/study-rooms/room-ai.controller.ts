// apps/api/src/modules/study-rooms/room-ai.controller.ts
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto";
import { RoomAiService } from "./room-ai.service";

@Controller("api/study-rooms/:roomId/ai/answers")
@UseGuards(SessionGuard)
export class RoomAiController {
    constructor(private readonly roomAiService: RoomAiService) {}

    @Post()
    answer(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: AskRoomAiDto,
    ) {
        return this.roomAiService.answer(request.user as AuthenticatedUser, roomId, dto);
    }
}