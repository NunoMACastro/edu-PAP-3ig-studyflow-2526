// apps/api/src/modules/classes/dto/add-class-student.dto.ts
import { IsEmail } from "class-validator";

export class AddClassStudentDto {
    @IsEmail()
    email!: string;
}