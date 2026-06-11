// apps/api/src/modules/material-versions/material-versions.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateMaterialVersionDto } from "./dto/material-version.dto";
import { MaterialVersionsService } from "./material-versions.service";

@UseGuards(SessionGuard)
@Controller("api/material-index/jobs/:jobId/versions")
export class MaterialVersionsController {
    constructor(private readonly versionsService: MaterialVersionsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string, @Body() dto: CreateMaterialVersionDto) {
        return this.versionsService.create(actor, jobId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string) {
        return this.versionsService.list(actor, jobId);
    }
}

// apps/api/src/modules/material-versions/material-versions.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialIndexModule } from "../material-index/material-index.module";
import { MaterialVersionsController } from "./material-versions.controller";
import { MaterialVersionsService } from "./material-versions.service";
import { MaterialVersion, MaterialVersionSchema } from "./schemas/material-version.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialVersion.name, schema: MaterialVersionSchema }]), MaterialIndexModule],
    controllers: [MaterialVersionsController],
    providers: [MaterialVersionsService],
    exports: [MaterialVersionsService],
})
export class MaterialVersionsModule {}