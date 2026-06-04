// apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts
import { ArrayMaxSize, IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class AskRoomAiDto {
    @IsString()
    @MinLength(10)
    @MaxLength(800)
    question!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(12)
    @IsMongoId({ each: true })
    sourceIds?: string[];
}