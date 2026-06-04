// apps/api/src/modules/classes/dto/create-class.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(24)
    code!: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    schoolYear!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}