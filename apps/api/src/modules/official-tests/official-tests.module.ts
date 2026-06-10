// apps/api/src/modules/official-tests/official-tests.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { OfficialTestsController } from "./official-tests.controller.js";
import { OfficialTestsService } from "./official-tests.service.js";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema.js";

@Module({
    imports: [MongooseModule.forFeature([{ name: OfficialTest.name, schema: OfficialTestSchema }]), SubjectsModule],
    controllers: [OfficialTestsController],
    providers: [OfficialTestsService],
    exports: [OfficialTestsService],
})
export class OfficialTestsModule {}