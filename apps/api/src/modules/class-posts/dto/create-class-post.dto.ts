// apps/api/src/modules/class-posts/dto/create-class-post.dto.ts
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassPostDto {
    @IsIn(["NOTICE", "POST"])
    type!: "NOTICE" | "POST";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    body!: string;
}