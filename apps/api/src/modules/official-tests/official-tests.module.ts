// apps/api/src/modules/official-tests/official-tests.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { OfficialTestsController } from "./official-tests.controller";
import { OfficialTestsService } from "./official-tests.service";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: OfficialTest.name, schema: OfficialTestSchema }]), SubjectsModule],
    controllers: [OfficialTestsController],
    providers: [OfficialTestsService],
    exports: [OfficialTestsService],
})
export class OfficialTestsModule {}