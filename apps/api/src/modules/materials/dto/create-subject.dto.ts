// apps/api/src/modules/subjects/dto/create-subject.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSubjectDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(24)
    code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}