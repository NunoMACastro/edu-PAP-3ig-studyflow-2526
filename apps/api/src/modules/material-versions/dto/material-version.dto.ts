// apps/api/src/modules/material-versions/dto/material-version.dto.ts
import { ArrayMaxSize, IsArray, IsString, MaxLength, MinLength } from "class-validator";

export class CreateMaterialVersionDto {
    @IsString()
    @MinLength(3)
    @MaxLength(300)
    title!: string;

    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    changeSummary!: string[];
}