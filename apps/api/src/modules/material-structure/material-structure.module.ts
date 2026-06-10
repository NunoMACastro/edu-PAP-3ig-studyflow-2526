import { Module } from "@nestjs/common";
/// <reference path="./ambient.d.ts" />
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialIndexModule } from "../material-index/material-index.module";
import { MaterialStructureController } from "./material-structure.controller";
import { MaterialStructureService } from "./material-structure.service";
import { MaterialStructure, MaterialStructureSchema } from "../schemas/material-structure.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialStructure.name, schema: MaterialStructureSchema }]), MaterialIndexModule],
    controllers: [MaterialStructureController],
    providers: [MaterialStructureService],
    exports: [MaterialStructureService],
})
export class MaterialStructureModule {}