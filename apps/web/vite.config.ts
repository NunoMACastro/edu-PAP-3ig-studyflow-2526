import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Configuração Vite do frontend StudyFlow.
 *
 * O proxy mantém o contrato `/api/*` usado nos BKs e permite que o browser
 * envie cookies HttpOnly para a API local durante desenvolvimento.
 */
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
});
