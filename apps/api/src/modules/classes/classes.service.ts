import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ClassesService {
    async findOwnedClass(teacherId: string, classId: string) {
        if (!Types.ObjectId.isValid(classId)) {
            throw new NotFoundException("Turma não encontrada.");
        }

        return { _id: new Types.ObjectId(classId) };
    }

    async ensureStudentEnrollment(studentId: string, classId: string) {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(classId)) {
            throw new NotFoundException("Aluno ou turma não encontrada.");
        }

        return;
    }
}
