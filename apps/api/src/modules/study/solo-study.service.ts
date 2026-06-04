import { Injectable } from "@nestjs/common";
import { MaterialsService } from "../materials/materials.service.js";
import { StudentProfileService } from "../students/student-profile.service.js";
import { StudyAreasService } from "../study-rooms/study-rooms.service.js";
import { SoloStudyStateDto } from "./dto/solo-study-state.dto.js";
import { RoutinesService } from "./routines.service.js";

/**
 * Serviço do modo individual de estudo.
 *
 * RF04 fica garantido porque este estado não exige turma nem dados docentes.
 */
@Injectable()
export class SoloStudyService {
    constructor(
        private readonly profileService: StudentProfileService,
        private readonly routinesService: RoutinesService,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
    ) {}

    /**
     * Constrói o estado base do dashboard individual.
     *
     * @param userId Identificador do aluno autenticado.
     * @returns Estado seguro para alunos com ou sem turma.
     */
    async getSoloStudyState(userId: string): Promise<SoloStudyStateDto> {
        const [profile, routinesCount, studyAreasCount, materialsCount] =
            await Promise.all([
            this.profileService.getMyProfile(userId),
            this.routinesService.countRoutines(userId),
            this.studyAreasService.countMyStudyAreas(userId),
            this.materialsService.countMine(userId),
        ]);

        return {
            studentName: profile?.name ?? "Aluno",
            hasClass: Boolean(profile?.className),
            className: profile?.className ?? null,
            studyAreasCount,
            routinesCount,
            materialsCount,
        };
    }
}
