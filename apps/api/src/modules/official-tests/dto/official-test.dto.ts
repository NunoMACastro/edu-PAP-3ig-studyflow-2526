// apps/api/src/modules/official-tests/dto/official-test.dto.ts
import { ArrayMinSize, IsArray, IsEnum, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class OfficialTestQuestionDto {
    @IsString()
    @MinLength(5)
    statement!: string;

    @IsArray()
    @ArrayMinSize(2)
    @IsString({ each: true })
    options!: string[];

    @IsString()
    @MinLength(1)
    correctAnswer!: string;
}

export class CreateOfficialTestDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsEnum(["MINI_TEST", "TEST"])
    type!: "MINI_TEST" | "TEST";

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OfficialTestQuestionDto)
    questions!: OfficialTestQuestionDto[];
}