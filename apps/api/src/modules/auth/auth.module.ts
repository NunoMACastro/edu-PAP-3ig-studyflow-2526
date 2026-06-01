import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Redis } from "ioredis";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { UsersService } from "../users/users.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { SessionService, SESSION_REDIS } from "./session.service.js";
import { User, UserSchema } from "./schemas/user.schema.js";

/**
 * Módulo de autenticação.
 *
 * Exporta `SessionService`, `SessionGuard` e `UsersService` porque os BKs
 * seguintes precisam de proteger rotas e resolver o utilizador autenticado.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UsersService,
        SessionService,
        SessionGuard,
        {
            provide: SESSION_REDIS,
            /**
             * Cria o cliente Redis usado pelas sessões.
             *
             * @returns Instância `ioredis` ligada a `REDIS_URL` ou ao Redis local.
             */
            useFactory: () =>
                new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379"),
        },
    ],
    exports: [AuthService, UsersService, SessionService, SessionGuard],
})
export class AuthModule {}
