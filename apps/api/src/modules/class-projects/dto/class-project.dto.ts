// apps/api/src/modules/class-projects/dto/class-project.dto.ts
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassProjectDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(20)
    @MaxLength(12000)
    brief!: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}