// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module";
import { ClassProjectsModule } from "../class-projects/class-projects.module";
import { ProjectAiModule } from "../project-ai/project-ai.module";
import { OfficialTestsModule } from "../official-tests/official-tests.module";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module";
import { ClassProgressModule } from "../class-progress/class-progress.module";
import { MaterialIndexModule } from "../material-index/material-index.module";
import { MaterialStructureModule } from "../material-structure/material-structure.module";
import { MaterialVersionsModule } from "../material-versions/material-versions.module";
import { MaterialContextsModule } from "../material-contexts/material-contexts.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        ClassProgressModule,
        MaterialIndexModule,
        MaterialStructureModule,
        MaterialVersionsModule,
        MaterialContextsModule,
    ],
})
export class Mf2Module {}
