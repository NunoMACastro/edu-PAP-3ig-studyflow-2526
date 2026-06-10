import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { AiContentReviewsController } from "./ai-content-reviews.controller.js";
import { AiContentReviewsService } from "./ai-content-reviews.service.js";
import { AiContentReview, AiContentReviewSchema } from "./schemas/ai-content-review.schema.js";

@Module({
    imports: [MongooseModule.forFeature([{ name: AiContentReview.name, schema: AiContentReviewSchema }]), SubjectsModule, OfficialMaterialsModule],
    controllers: [AiContentReviewsController],
    providers: [AiContentReviewsService],
    exports: [AiContentReviewsService],
})
export class AiContentReviewsModule {}