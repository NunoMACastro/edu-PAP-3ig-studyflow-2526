import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { MaterialsModule } from "../materials/materials.module";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AiAreaProfileController } from "./ai-area-profile.controller";
import { AiAreaProfileService } from "./ai-area-profile.service";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema";

@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        MaterialsModule,
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
        ]),
    ],
    controllers: [AiAreaProfileController],
    providers: [AiAreaProfileService],
    exports: [AiAreaProfileService],
})
export class AiModule {}