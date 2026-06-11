// apps/api/src/modules/material-contexts/material-contexts.module.ts
import { Module } from "@nestjs/common";
import { MaterialsModule } from "../materials/materials.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { MaterialContextsController } from "./material-contexts.controller";
import { MaterialContextsService } from "./material-contexts.service";

@Module({
    imports: [MaterialsModule, SubjectsModule, OfficialMaterialsModule],
    controllers: [MaterialContextsController],
    providers: [MaterialContextsService],
    exports: [MaterialContextsService],
})
export class MaterialContextsModule {}