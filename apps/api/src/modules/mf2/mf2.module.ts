// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module.js";
import { ClassProjectsModule } from "../class-projects/class-projects.module.js";
import { ProjectAiModule } from "../project-ai/project-ai.module.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module.js";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
        ProjectAiModule,
        OfficialTestsModule,
        AiContentReviewsModule,
    ],
})
export class Mf2Module {}
