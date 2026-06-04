import * as bcrypt from "bcrypt";
import mongoose, { Model } from "mongoose";

import { User, UserRole, UserSchema } from "../modules/auth/schemas/user.schema";

const BCRYPT_COST = 12;

type DevelopmentUserSeed = {
    email: string;
    password: string;
    role: UserRole;
};

const developmentUsers: DevelopmentUserSeed[] = [
    {
        email: "professor.dev@studyflow.local",
        password: "ProfessorDev123!",
        role: "TEACHER",
    },
    {
        email: "aluno.dev@studyflow.local",
        password: "AlunoDev123!",
        role: "STUDENT",
    },
];

async function ensureDevelopmentUser(
    userModel: Model<User>,
    seed: DevelopmentUserSeed,
): Promise<void> {
    const email = seed.email.toLowerCase();
    const existingUser = await userModel.findOne({ email }).exec();

    if (existingUser) {
        if (existingUser.role !== seed.role) {
            console.log(
                `Conta ${email} já existe com role ${existingUser.role}; não será alterada para ${seed.role}.`,
            );
            return;
        }

        console.log(`Conta de desenvolvimento já existe: ${email}.`);
        return;
    }

    const passwordHash = await bcrypt.hash(seed.password, BCRYPT_COST);

    await userModel.create({
        email,
        passwordHash,
        role: seed.role,
        authProvider: "local",
    });

    console.log(`Conta de desenvolvimento criada: ${email} (${seed.role}).`);
}

async function main(): Promise<void> {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Esta seed não pode ser executada em produção.");
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("Define MONGODB_URI antes de executar a seed.");
    }

    const connection = await mongoose.createConnection(mongoUri).asPromise();

    try {
        const UserModel = connection.model<User>(User.name, UserSchema);

        for (const seed of developmentUsers) {
            await ensureDevelopmentUser(UserModel, seed);
        }
    } finally {
        await connection.close();
    }
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Erro inesperado na seed.";
    console.error(message);
    process.exitCode = 1;
});