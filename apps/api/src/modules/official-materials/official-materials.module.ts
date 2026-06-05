// apps/api/src/modules/official-materials/official-materials.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { OfficialMaterialsController } from "./official-materials.controller";
import { OfficialMaterialsService } from "./official-materials.service";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "./schemas/official-material.schema";

@Module({
    imports: [
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialMaterial.name, schema: OfficialMaterialSchema },
        ]),
    ],
    controllers: [OfficialMaterialsController],
    providers: [OfficialMaterialsService],
    exports: [OfficialMaterialsService, MongooseModule],
})
export class OfficialMaterialsModule {}