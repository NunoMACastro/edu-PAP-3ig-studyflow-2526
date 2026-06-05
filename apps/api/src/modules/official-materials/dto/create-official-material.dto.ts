// apps/api/src/modules/official-materials/dto/create-official-material.dto.ts
import {
    IsIn,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

export class CreateOfficialMaterialDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsIn(["TEXT", "URL"])
    type!: "TEXT" | "URL";

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "TEXT")
    @IsString()
    @MinLength(20)
    @MaxLength(20000)
    textContent?: string;

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "URL")
    @IsUrl({ require_protocol: true })
    @MaxLength(1000)
    sourceUrl?: string;
}