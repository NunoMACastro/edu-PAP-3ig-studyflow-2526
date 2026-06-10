import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateMaterialStructureDto {
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(30)
    @IsString({ each: true })
    manualTopics?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    teacherNote?: string;
}