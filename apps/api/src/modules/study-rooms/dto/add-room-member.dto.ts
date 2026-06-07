import { IsEmail } from "class-validator";

/**
 * Pedido para adicionar um aluno existente à sala.
 */
export class AddRoomMemberDto {
    @IsEmail()
    email!: string;
}
