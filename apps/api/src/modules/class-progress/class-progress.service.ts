// apps/api/src/modules/class-progress/class-progress.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassPostsService } from "../class-posts/class-posts.service";
import { ClassesService } from "../classes/classes.service";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto";
import { ClassProgressNote, ClassProgressNoteDocument } from "./schemas/class-progress-note.schema";

@Injectable()
export class ClassProgressService {
    constructor(
        @InjectModel(ClassProgressNote.name)
        private readonly notes: Model<ClassProgressNoteDocument>,
        private readonly classesService: ClassesService,
        private readonly classPostsService: ClassPostsService,
    ) {}

    async createNote(actor: AuthenticatedUser, classId: string, dto: CreateClassProgressNoteDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const note = await this.notes.create({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id), title: dto.title.trim(), note: dto.note.trim(), difficultyTags: dto.difficultyTags ?? [] });
        return this.toNoteView(note);
    }

    async dashboard(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const [notes, posts] = await Promise.all([
            this.notes.find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean(),
            this.classPostsService.listForTeacher(actor, classId),
        ]);
        return { classId: schoolClass._id.toString(), noteCount: notes.length, postCount: posts.length, difficultyTags: [...new Set(notes.flatMap((note) => note.difficultyTags))], notes: notes.map((note) => this.toNoteView(note)) };
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem consultar métricas da turma.");
        }
    }
    private toNoteView(note: ClassProgressNote) {
        return { id: note._id.toString(), title: note.title, note: note.note, difficultyTags: note.difficultyTags };
    }
}