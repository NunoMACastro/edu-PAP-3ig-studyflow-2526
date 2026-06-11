// apps/api/src/modules/material-contexts/material-contexts.controller.ts
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialContextsService } from "./material-contexts.service";

@UseGuards(SessionGuard)
@Controller()
export class MaterialContextsController {
    constructor(private readonly contextsService: MaterialContextsService) {}

    @Get("api/material-contexts/student/:studyAreaId")
    listPrivateForStudent(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string) {
        return this.contextsService.listPrivateForStudent(actor, studyAreaId);
    }

    @Get("api/material-contexts/subjects/:subjectId")
    listOfficialForStudent(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.contextsService.listOfficialForStudent(actor, subjectId);
    }

    @Get("api/teacher/material-contexts/subjects/:subjectId")
    listOfficialForTeacher(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.contextsService.listOfficialForTeacher(actor, subjectId);
    }
}
