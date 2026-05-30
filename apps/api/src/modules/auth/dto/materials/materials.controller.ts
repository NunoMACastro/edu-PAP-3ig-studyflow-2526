import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { MaterialsService } from "./materials.service";

@Controller("api/study-areas/:studyAreaId/materials")
@UseGuards(SessionGuard)
export class MaterialsController {
    constructor(private readonly materialsService: MaterialsService) {}

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.materialsService.listByArea(request.user!.id, studyAreaId);
    }

    @Post("file")
    @UseInterceptors(FileInterceptor("file"))
    uploadFile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body("title") title?: string,
    ) {
        return this.materialsService.submitFile(
            request.user!.id,
            studyAreaId,
            file,
            title,
        );
    }

    @Post()
    submitText(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: CreateMaterialDto,
    ) {
        return this.materialsService.submitTextMaterial(
            request.user!.id,
            studyAreaId,
            body,
        );
    }
}