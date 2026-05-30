import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { MaterialsController } from "./materials.controller";
import { MaterialsService } from "./materials.service";
import { MaterialStorageService } from "./material-storage.service";
import { Material, MaterialSchema } from "./schemas/material.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Material.name, schema: MaterialSchema },
        ]),
        StudyAreasModule,
    ],
    controllers: [MaterialsController],
    providers: [MaterialsService, MaterialStorageService],
    exports: [MaterialsService],
})
export class MaterialsModule {}