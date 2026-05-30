/// <reference path="../../../../../types/ambient.d.ts" />
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";
import { Express } from "express";
import path from "path";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

export function validateMaterialUpload(file: Express.Multer.File): void {
    if (!file) {
        throw new BadRequestException({
            code: "FILE_REQUIRED",
            message: "Envia um ficheiro PDF ou DOCX.",
        });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        throw new PayloadTooLargeException({
            code: "FILE_TOO_LARGE",
            message: "O ficheiro excede o limite permitido.",
        });
    }

    const expectedExt = MIME_TO_EXT[file.mimetype];
    if (!expectedExt) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Só são aceites ficheiros PDF ou DOCX.",
        });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== expectedExt) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_EXTENSION",
            message: "Extensão inválida. Só são aceites PDF ou DOCX.",
        });
    }
}

export function materialTypeFromMime(mimeType: string): "PDF" | "DOCX" {
    switch (mimeType) {
        case "application/pdf":
            return "PDF";
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "DOCX";
        default:
            throw new BadRequestException({
                code: "UNSUPPORTED_FILE_TYPE",
                message: "Tipo de ficheiro inválido.",
            });
    }
}
