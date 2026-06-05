// apps/api/src/modules/study-rooms/room-shares.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomSharesService } from "./room-shares.service";

@Controller("api/study-rooms/:roomId/shares")
@UseGuards(SessionGuard)
export class RoomSharesController {
    constructor(private readonly roomSharesService: RoomSharesService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: CreateRoomShareDto,
    ) {
        return this.roomSharesService.create(request.user as AuthenticatedUser, roomId, dto);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("roomId") roomId: string) {
        return this.roomSharesService.list(request.user as AuthenticatedUser, roomId);
    }
}