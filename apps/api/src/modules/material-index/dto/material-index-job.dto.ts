// apps/api/src/modules/material-index/dto/material-index-job.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

export class StartMaterialIndexDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}