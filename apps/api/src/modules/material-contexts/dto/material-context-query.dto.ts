// apps/api/src/modules/material-contexts/dto/material-context-query.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

export class MaterialContextQueryDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}