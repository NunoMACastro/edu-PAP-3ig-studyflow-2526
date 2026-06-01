export type User = {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
};

export type StudentProfile = {
    _id?: string;
    name: string;
    year?: string | null;
    course?: string | null;
    className?: string | null;
};

export type SoloStudyState = {
    studentName: string;
    hasClass: boolean;
    className: string | null;
    studyAreasCount: number;
    routinesCount: number;
    materialsCount: number;
};

export type StudyRoutine = {
    _id: string;
    title: string;
    weekdays: string[];
    startTime: string;
    durationMinutes: number;
    archived?: boolean;
};

export type StudyGoal = {
    _id: string;
    title: string;
    description?: string;
    targetDate?: string;
    completed?: boolean;
    archived?: boolean;
};

export type StudyArea = {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    archived?: boolean;
    voiceTone?: string;
    voiceDetailLevel?: string;
    voiceNotes?: string;
};

export type StudyMaterial = {
    _id: string;
    title: string;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    status: "PENDING_PROCESSING" | "READY" | "FAILED";
    url?: string;
    sizeBytes?: number;
    createdAt?: string;
};

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export type AiArtifactSource = {
    materialId?: string;
    title?: string;
};

export type AiArtifact = {
    _id: string;
    type: "SUMMARY" | StudyToolType;
    contentJson: Record<string, unknown>;
    sourcesJson: AiArtifactSource[];
};

/**
 * Executa um pedido JSON para a API mantendo cookies HttpOnly.
 *
 * @param path Caminho relativo começado por `/api`.
 * @param options Opções fetch adicionais.
 * @returns JSON parseado no tipo pedido pelo chamador.
 */
async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    headers.set("x-studyflow-csrf", "1");

    const response = await fetch(path, {
        ...options,
        credentials: "include",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Ocorreu um erro inesperado.",
        }));
        throw new Error(error.message ?? "Ocorreu um erro inesperado.");
    }

    return response.json() as Promise<T>;
}

/**
 * Regista um aluno por email/password.
 *
 * @param input Dados do formulário de registo.
 * @returns Utilizador público criado.
 */
export function registerStudent(input: {
    email: string;
    password: string;
    confirmPassword: string;
}): Promise<User> {
    return requestJson<User>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Inicia sessão com email/password.
 *
 * @param input Credenciais do aluno.
 * @returns Utilizador autenticado.
 */
export function login(input: {
    email: string;
    password: string;
}): Promise<User> {
    return requestJson<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Termina a sessão atual.
 *
 * @returns Estado de sucesso.
 */
export function logout(): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

/**
 * Obtém o utilizador autenticado.
 *
 * @returns Utilizador ou lança erro quando não há sessão.
 */
export function getCurrentUser(): Promise<User> {
    return requestJson<User>("/api/auth/me");
}

/**
 * Obtém o perfil do aluno autenticado.
 *
 * @returns Perfil existente ou `null`.
 */
export function getProfile(): Promise<StudentProfile | null> {
    return requestJson<StudentProfile | null>("/api/students/me/profile");
}

/**
 * Atualiza o perfil do aluno.
 *
 * @param input Campos editáveis.
 * @returns Perfil atualizado.
 */
export function updateProfile(input: StudentProfile): Promise<StudentProfile> {
    return requestJson<StudentProfile>("/api/students/me/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Obtém estado do dashboard individual.
 *
 * @returns Estado do modo individual.
 */
export function getSoloStudyState(): Promise<SoloStudyState> {
    return requestJson<SoloStudyState>("/api/study/solo");
}

/**
 * Lista rotinas e objetivos do aluno.
 *
 * @returns Dados de organização pessoal.
 */
export function listRoutines(): Promise<{
    routines: StudyRoutine[];
    goals: StudyGoal[];
}> {
    return requestJson("/api/study/routines");
}

/**
 * Lista objetivos do aluno através do endpoint dedicado.
 *
 * @returns Objetivos ativos.
 */
export function listGoals(): Promise<StudyGoal[]> {
    return requestJson<StudyGoal[]>("/api/study/goals");
}

/**
 * Cria uma rotina de estudo.
 *
 * @param input Dados da rotina.
 * @returns Rotina criada.
 */
export function createRoutine(input: {
    title: string;
    weekdays: string[];
    startTime: string;
    durationMinutes: number;
}): Promise<unknown> {
    return requestJson("/api/study/routines", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza uma rotina de estudo.
 *
 * @param routineId Identificador da rotina.
 * @param input Campos editáveis.
 * @returns Rotina atualizada.
 */
export function updateRoutine(
    routineId: string,
    input: Partial<{
        title: string;
        weekdays: string[];
        startTime: string;
        durationMinutes: number;
    }>,
): Promise<StudyRoutine> {
    return requestJson<StudyRoutine>(`/api/study/routines/${routineId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Arquiva uma rotina sem apagar fisicamente.
 *
 * @param routineId Identificador da rotina.
 * @returns Estado de sucesso.
 */
export function archiveRoutine(routineId: string): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>(`/api/study/routines/${routineId}`, {
        method: "DELETE",
    });
}

/**
 * Cria um objetivo de estudo.
 *
 * @param input Dados do objetivo.
 * @returns Objetivo criado.
 */
export function createGoal(input: {
    title: string;
    description?: string;
    targetDate?: string;
}): Promise<unknown> {
    return requestJson("/api/study/goals", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza um objetivo de estudo.
 *
 * @param goalId Identificador do objetivo.
 * @param input Campos editáveis.
 * @returns Objetivo atualizado.
 */
export function updateGoal(
    goalId: string,
    input: Partial<{
        title: string;
        description: string;
        targetDate: string;
        completed: boolean;
    }>,
): Promise<StudyGoal> {
    return requestJson<StudyGoal>(`/api/study/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Arquiva um objetivo sem apagar fisicamente.
 *
 * @param goalId Identificador do objetivo.
 * @returns Estado de sucesso.
 */
export function archiveGoal(goalId: string): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>(`/api/study/goals/${goalId}`, {
        method: "DELETE",
    });
}

/**
 * Lista eventos recentes de estudo.
 *
 * @returns Histórico do aluno.
 */
export function listStudyHistory(): Promise<unknown[]> {
    return requestJson("/api/study/history");
}

/**
 * Lista áreas de estudo pessoais.
 *
 * @returns Áreas ativas.
 */
export function listStudyAreas(): Promise<StudyArea[]> {
    return requestJson<StudyArea[]>("/api/study-areas");
}

/**
 * Obtém uma área de estudo.
 *
 * @param studyAreaId Identificador da área.
 * @returns Área encontrada.
 */
export function getStudyArea(studyAreaId: string): Promise<StudyArea> {
    return requestJson<StudyArea>(`/api/study-areas/${studyAreaId}`);
}

/**
 * Cria uma área de estudo.
 *
 * @param input Dados da área.
 * @returns Área criada.
 */
export function createStudyArea(input: {
    name: string;
    description?: string;
    color?: string;
}): Promise<StudyArea> {
    return requestJson<StudyArea>("/api/study-areas", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza campos editáveis de uma área de estudo.
 *
 * @param studyAreaId Identificador da área.
 * @param input Campos editáveis.
 * @returns Área atualizada.
 */
export function updateStudyArea(
    studyAreaId: string,
    input: Partial<{
        name: string;
        description: string;
        color: string;
        archived: boolean;
    }>,
): Promise<StudyArea> {
    return requestJson<StudyArea>(`/api/study-areas/${studyAreaId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Arquiva uma área de estudo sem apagar fisicamente.
 *
 * @param studyAreaId Identificador da área.
 * @returns Área arquivada.
 */
export function archiveStudyArea(studyAreaId: string): Promise<StudyArea> {
    return updateStudyArea(studyAreaId, { archived: true });
}

/**
 * Atualiza a voz pedagógica da área.
 *
 * @param studyAreaId Identificador da área.
 * @param input Preferências de voz.
 * @returns Área atualizada.
 */
export function updateStudyAreaVoice(
    studyAreaId: string,
    input: {
        voiceTone: string;
        voiceDetailLevel: string;
        voiceNotes?: string;
    },
): Promise<StudyArea> {
    return requestJson<StudyArea>(`/api/study-areas/${studyAreaId}/voice`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Lista materiais de uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Materiais submetidos.
 */
export function listMaterials(studyAreaId: string): Promise<StudyMaterial[]> {
    return requestJson<StudyMaterial[]>(
        `/api/study-areas/${studyAreaId}/materials`,
    );
}

/**
 * Submete URL ou tópico textual.
 *
 * @param studyAreaId Identificador da área.
 * @param input Dados do material.
 * @returns Material criado.
 */
export function submitTextMaterial(
    studyAreaId: string,
    input: {
        type: "URL" | "TOPIC";
        title: string;
        url?: string;
        topicText?: string;
    },
): Promise<StudyMaterial> {
    return requestJson<StudyMaterial>(
        `/api/study-areas/${studyAreaId}/materials`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Submete PDF ou DOCX via multipart.
 *
 * @param studyAreaId Identificador da área.
 * @param file Ficheiro escolhido pelo aluno.
 * @param title Título opcional.
 * @returns Material criado.
 */
export async function submitFileMaterial(
    studyAreaId: string,
    file: File,
    title?: string,
): Promise<StudyMaterial> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const response = await fetch(
        `/api/study-areas/${studyAreaId}/materials/file`,
        {
            method: "POST",
            credentials: "include",
            headers: { "x-studyflow-csrf": "1" },
            body: formData,
        },
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Não foi possível submeter o ficheiro.",
        }));
        throw new Error(error.message ?? "Não foi possível submeter o ficheiro.");
    }

    return response.json() as Promise<StudyMaterial>;
}

/**
 * Prepara o perfil IA de uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Estado do perfil IA.
 */
export function prepareAiProfile(studyAreaId: string): Promise<unknown> {
    return requestJson(`/api/study-areas/${studyAreaId}/ai-profile`, {
        method: "POST",
    });
}

/**
 * Gera resumo IA para uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Artefacto de resumo.
 */
export function generateSummary(studyAreaId: string): Promise<AiArtifact> {
    return requestJson<AiArtifact>(`/api/study-areas/${studyAreaId}/summaries`, {
        method: "POST",
    });
}

/**
 * Lista ferramentas de estudo já geradas.
 *
 * @param studyAreaId Identificador da área.
 * @param type Tipo opcional.
 * @returns Artefactos IA.
 */
export function listStudyTools(
    studyAreaId: string,
    type?: StudyToolType,
): Promise<AiArtifact[]> {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return requestJson<AiArtifact[]>(
        `/api/study-areas/${studyAreaId}/study-tools${query}`,
    );
}

/**
 * Gera explicação, flashcards ou quiz.
 *
 * @param studyAreaId Identificador da área.
 * @param input Pedido de geração.
 * @returns Artefacto criado.
 */
export function generateStudyTool(
    studyAreaId: string,
    input: { type: StudyToolType; topic?: string },
): Promise<AiArtifact> {
    return requestJson<AiArtifact>(
        `/api/study-areas/${studyAreaId}/study-tools`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
