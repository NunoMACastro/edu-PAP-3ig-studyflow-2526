import { Injectable, BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { Express } from "express";

@Injectable()
export class MaterialStorageService {
    private readonly root =
        process.env.MATERIALS_STORAGE_DIR ?? "storage/materials";

    private readonly extensionMap: Record<string, string> = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    };

    async save(file: Express.Multer.File): Promise<string> {
        const extension = this.extensionMap[file.mimetype];

        if (!extension) {
            throw new BadRequestException("Unsupported MIME type");
        }

        await mkdir(this.root, { recursive: true });

        const storageKey = `${randomUUID()}.${extension}`;
        const filePath = join(this.root, storageKey);

        await writeFile(filePath, file.buffer);

        return storageKey;
    }
}
