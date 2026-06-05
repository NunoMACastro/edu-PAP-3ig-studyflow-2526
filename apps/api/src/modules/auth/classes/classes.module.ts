// apps/api/src/modules/classes/classes.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../schemas/user.schema";
import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import { SchoolClass, SchoolClassSchema } from "./school-class.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SchoolClass.name, schema: SchoolClassSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ClassesController],
    providers: [ClassesService],
    exports: [ClassesService, MongooseModule],
})
export class ClassesModule {}