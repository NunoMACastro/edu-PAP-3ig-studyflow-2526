import { Module } from "@nestjs/common";
import { ClassesService } from "./classes.service";

@Module({
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule {}
