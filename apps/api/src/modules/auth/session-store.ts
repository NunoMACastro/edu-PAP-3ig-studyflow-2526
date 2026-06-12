export type SessionStore = {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode: "EX", seconds: number): Promise<unknown>;
    del(key: string): Promise<unknown>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
};

type InMemoryEntry = {
    value: string;
    expiresAt?: number;
};

/**
 * Cria um store de sessão volátil para testes E2E autocontidos.
 *
 * Este store implementa apenas os comandos Redis usados por autenticação e
 * rate limiting. Não deve ser usado em produção porque perde estado ao reiniciar.
 */
export function createInMemorySessionStore(): SessionStore {
    const entries = new Map<string, InMemoryEntry>();

    function deleteIfExpired(key: string): void {
        const entry = entries.get(key);
        if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
            entries.delete(key);
        }
    }

    return {
        async get(key: string): Promise<string | null> {
            deleteIfExpired(key);
            return entries.get(key)?.value ?? null;
        },

        async set(
            key: string,
            value: string,
            mode: "EX",
            seconds: number,
        ): Promise<"OK"> {
            entries.set(key, {
                value,
                expiresAt: mode === "EX" ? Date.now() + seconds * 1000 : undefined,
            });
            return "OK";
        },

        async del(key: string): Promise<number> {
            return entries.delete(key) ? 1 : 0;
        },

        async incr(key: string): Promise<number> {
            deleteIfExpired(key);
            const current = Number.parseInt(entries.get(key)?.value ?? "0", 10) || 0;
            const next = current + 1;
            const previousExpiry = entries.get(key)?.expiresAt;
            entries.set(key, { value: String(next), expiresAt: previousExpiry });
            return next;
        },

        async expire(key: string, seconds: number): Promise<number> {
            deleteIfExpired(key);
            const entry = entries.get(key);
            if (!entry) return 0;
            entries.set(key, {
                value: entry.value,
                expiresAt: Date.now() + seconds * 1000,
            });
            return 1;
        },
    };
}
