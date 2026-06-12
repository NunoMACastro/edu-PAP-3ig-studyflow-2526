import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateRoomShareDto } from "./dto/create-room-share.dto.js";
import { RoomSharesService } from "./room-shares.service.js";

/**
 * Controller de partilhas da sala.
 */
@Controller("api/study-rooms/:roomId/shares")
@UseGuards(SessionGuard)
export class RoomSharesController {
    constructor(private readonly roomSharesService: RoomSharesService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: CreateRoomShareDto,
    ) {
        return this.roomSharesService.createShare(request.user!, roomId, body);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("roomId") roomId: string) {
        return this.roomSharesService.listRoomShares(request.user!, roomId);
    }
}
