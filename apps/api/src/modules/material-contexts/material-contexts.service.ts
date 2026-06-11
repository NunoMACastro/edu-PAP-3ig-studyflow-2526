// apps/api/src/modules/material-contexts/material-contexts.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialsService } from "../materials/materials.service";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { MaterialContextView } from "./schemas/material-context.schema";

@Injectable()
export class MaterialContextsService {
    constructor(
        private readonly materialsService: MaterialsService,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    async listPrivateForStudent(actor: AuthenticatedUser, studyAreaId: string): Promise<MaterialContextView[]> {
        this.assertStudent(actor);
        const materials = await this.materialsService.listByArea(actor.id, studyAreaId);
        return materials.map((material) => ({ id: material._id.toString(), title: material.title, scope: "PRIVATE_AREA", contextId: studyAreaId, source: "student" }));
    }

    async listOfficialForStudent(actor: AuthenticatedUser, subjectId: string): Promise<MaterialContextView[]> {
        this.assertStudent(actor);
        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        return materials.map((material) => ({ id: material._id.toString(), title: material.title, scope: "OFFICIAL_SUBJECT", contextId: subject._id.toString(), source: "class" }));
    }

    async listOfficialForTeacher(actor: AuthenticatedUser, subjectId: string): Promise<MaterialContextView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        return materials.map((material) => ({ id: material._id.toString(), title: material.title, scope: "OFFICIAL_SUBJECT", contextId: subject._id.toString(), source: "teacher" }));
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar este contexto.");
        }
    }
    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem consultar este contexto.");
        }
    }
}