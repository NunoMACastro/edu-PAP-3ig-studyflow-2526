import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Valida ficheiros submetidos no BK-MF0-08.
 *
 * @param file Ficheiro recebido via multipart.
 * @returns Nada quando o ficheiro é aceite.
 * @throws BadRequestException quando falta ficheiro ou MIME é inválido.
 * @throws PayloadTooLargeException quando excede 10 MB.
 */
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

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Só são aceites ficheiros PDF ou DOCX.",
        });
    }
}

/**
 * Converte MIME validado para tipo canónico de material.
 *
 * @param mimeType MIME do ficheiro já validado.
 * @returns Tipo `PDF` ou `DOCX`.
 */
export function materialTypeFromMime(mimeType: string): "PDF" | "DOCX" {
    return mimeType === "application/pdf" ? "PDF" : "DOCX";
}
