// apps/api/src/modules/class-progress/class-progress.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassPostsModule } from "../class-posts/class-posts.module";
import { ClassesModule } from "../classes/classes.module";
import { ClassProgressController } from "./class-progress.controller";
import { ClassProgressService } from "./class-progress.service";
import { ClassProgressNote, ClassProgressNoteSchema } from "./schemas/class-progress-note.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassProgressNote.name, schema: ClassProgressNoteSchema }]), ClassesModule, ClassPostsModule],
    controllers: [ClassProgressController],
    providers: [ClassProgressService],
})
export class ClassProgressModule {}