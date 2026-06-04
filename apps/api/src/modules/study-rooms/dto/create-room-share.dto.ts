// apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts
import {
    IsIn,
    IsMongoId,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

export class CreateRoomShareDto {
    @IsIn(["NOTE", "URL", "MATERIAL_REF"])
    type!: "NOTE" | "URL" | "MATERIAL_REF";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "NOTE")
    @IsString()
    @MinLength(10)
    @MaxLength(12000)
    textContent?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "URL")
    @IsUrl({ require_protocol: true })
    @MaxLength(1000)
    sourceUrl?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "MATERIAL_REF")
    @IsMongoId()
    materialId?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "URL")
    @IsString()
    @MaxLength(12000)
    copiedText?: string;
}