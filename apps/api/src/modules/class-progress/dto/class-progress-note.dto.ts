// apps/api/src/modules/class-progress/dto/class-progress-note.dto.ts
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassProgressNoteDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    note!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(12)
    @IsString({ each: true })
    difficultyTags?: string[];
}