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
    page?: number;
    section?: string;
};

export type AiArtifact = {
    _id: string;
    studyAreaId: string;
    type: "SUMMARY" | StudyToolType;
    contentJson: Record<string, unknown>;
    sourcesJson: AiArtifactSource[];
    createdAt?: string;
    updatedAt?: string;
};

export type QuizAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    sourceMaterialIds: string[];
};

export type QuizAttemptResult = {
    _id: string;
    artifactId: string;
    studyAreaId: string;
    correctCount: number;
    totalQuestions: number;
    scorePercent: number;
    answeredAt: string;
    results: QuizAttemptQuestionResult[];
};

export type LearningProfile = {
    _id?: string;
    studyAreaId: string;
    pace: "SLOW" | "BALANCED" | "FAST";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    difficulties: string[];
    preferredExplanationStyle: string;
};

export type AdaptiveExplanation = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    suggestedNextSteps: string[];
    sourceMaterialIds: string[];
    createdAt?: string;
};

export type StudyRoom = {
    _id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: string;
};

export type RoomShare = {
    _id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent?: string;
    url?: string;
    materialId?: string;
    materialTitle?: string;
    usableByAi: boolean;
    createdAt?: string;
};

export type RoomAiAnswer = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    sources: { shareId: string; title: string; contentText: string }[];
    createdAt?: string;
};

export type SchoolClass = {
    _id: string;
    teacherId: string;
    name: string;
    code: string;
    schoolYear: string;
    studentIds: string[];
    createdAt?: string;
};

export type Subject = {
    _id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description?: string;
    createdAt?: string;
};

export type OfficialMaterial = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    type: "TEXT" | "URL";
    status: "PROCESSED" | "REFERENCE_ONLY";
    textContent?: string;
    sourceUrl?: string;
    createdAt?: string;
};

export type TeacherAiVoice = {
    _id?: string;
    subjectId: string;
    classId?: string;
    teacherId?: string;
    tone: "CALM" | "DIRECT" | "SOCRATIC";
    detailLevel: "SHORT" | "BALANCED" | "DETAILED";
    rules: string[];
};

export type ClassAiAnswer = {
    _id: string;
    subjectId: string;
    classId: string;
    question: string;
    answer: string;
    sources: OfficialMaterial[];
    createdAt?: string;
};

export type ClassPost = {
    _id: string;
    classId: string;
    teacherId: string;
    type: "NOTICE" | "POST";
    title: string;
    body: string;
    createdAt?: string;
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
 * Lista resumos IA já gerados para uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Resumos persistidos.
 */
export function listSummaries(studyAreaId: string): Promise<AiArtifact[]> {
    return requestJson<AiArtifact[]>(
        `/api/study-areas/${studyAreaId}/summaries`,
    );
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

/**
 * Submete respostas de um quiz gerado pela IA.
 *
 * @param studyAreaId Identificador da área.
 * @param artifactId Identificador do artefacto de quiz.
 * @param answers Índices das opções escolhidas.
 * @returns Resultado calculado pelo backend.
 */
export function submitQuizAttempt(
    studyAreaId: string,
    artifactId: string,
    answers: number[],
): Promise<QuizAttemptResult> {
    return requestJson<QuizAttemptResult>(
        `/api/study-areas/${studyAreaId}/study-tools/${artifactId}/quiz-attempts`,
        {
            method: "POST",
            body: JSON.stringify({ answers }),
        },
    );
}

export function getLearningProfile(studyAreaId: string): Promise<LearningProfile> {
    return requestJson<LearningProfile>(
        `/api/study-areas/${studyAreaId}/learning-profile`,
    );
}

export function updateLearningProfile(
    studyAreaId: string,
    input: {
        pace: LearningProfile["pace"];
        level: LearningProfile["level"];
        difficulties?: string[];
        preferredExplanationStyle?: string;
    },
): Promise<LearningProfile> {
    return requestJson<LearningProfile>(
        `/api/study-areas/${studyAreaId}/learning-profile`,
        {
            method: "PUT",
            body: JSON.stringify(input),
        },
    );
}

export function askAdaptiveExplanation(
    studyAreaId: string,
    question: string,
): Promise<AdaptiveExplanation> {
    return requestJson<AdaptiveExplanation>(
        `/api/study-areas/${studyAreaId}/adaptive-explanations`,
        {
            method: "POST",
            body: JSON.stringify({ question }),
        },
    );
}

export function listStudyRooms(): Promise<StudyRoom[]> {
    return requestJson<StudyRoom[]>("/api/study-rooms");
}

export function createStudyRoom(input: {
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
}): Promise<StudyRoom> {
    return requestJson<StudyRoom>("/api/study-rooms", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function addStudyRoomMember(
    roomId: string,
    email: string,
): Promise<StudyRoom> {
    return requestJson<StudyRoom>(`/api/study-rooms/${roomId}/members`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export function listRoomShares(roomId: string): Promise<RoomShare[]> {
    return requestJson<RoomShare[]>(`/api/study-rooms/${roomId}/shares`);
}

export function createRoomShare(
    roomId: string,
    input: {
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        url?: string;
        copiedText?: string;
        materialId?: string;
    },
): Promise<RoomShare> {
    return requestJson<RoomShare>(`/api/study-rooms/${roomId}/shares`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function askRoomAi(
    roomId: string,
    input: { question: string; sourceIds?: string[] },
): Promise<RoomAiAnswer> {
    return requestJson<RoomAiAnswer>(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function listTeacherClasses(): Promise<SchoolClass[]> {
    return requestJson<SchoolClass[]>("/api/teacher/classes");
}

export function createTeacherClass(input: {
    name: string;
    code: string;
    schoolYear: string;
}): Promise<SchoolClass> {
    return requestJson<SchoolClass>("/api/teacher/classes", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function addClassStudent(
    classId: string,
    email: string,
): Promise<SchoolClass> {
    return requestJson<SchoolClass>(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export function listStudentClasses(): Promise<SchoolClass[]> {
    return requestJson<SchoolClass[]>("/api/student/classes");
}

export function listSubjects(classId: string): Promise<Subject[]> {
    return requestJson<Subject[]>(`/api/teacher/classes/${classId}/subjects`);
}

export function listStudentSubjects(classId: string): Promise<Subject[]> {
    return requestJson<Subject[]>(`/api/student/classes/${classId}/subjects`);
}

export function createSubject(
    classId: string,
    input: { name: string; code: string; description?: string },
): Promise<Subject> {
    return requestJson<Subject>(`/api/teacher/classes/${classId}/subjects`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function listOfficialMaterials(
    subjectId: string,
): Promise<OfficialMaterial[]> {
    return requestJson<OfficialMaterial[]>(
        `/api/teacher/subjects/${subjectId}/materials`,
    );
}

export function createOfficialMaterial(
    subjectId: string,
    input: {
        title: string;
        type: "TEXT" | "URL";
        textContent?: string;
        sourceUrl?: string;
    },
): Promise<OfficialMaterial> {
    return requestJson<OfficialMaterial>(
        `/api/teacher/subjects/${subjectId}/materials`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

export function getTeacherAiVoice(subjectId: string): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/subjects/${subjectId}/ai-voice`,
    );
}

export function updateTeacherAiVoice(
    subjectId: string,
    input: {
        tone: TeacherAiVoice["tone"];
        detailLevel: TeacherAiVoice["detailLevel"];
        rules?: string[];
    },
): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/subjects/${subjectId}/ai-voice`,
        {
            method: "PUT",
            body: JSON.stringify(input),
        },
    );
}

export function askClassAi(
    subjectId: string,
    question: string,
): Promise<ClassAiAnswer> {
    return requestJson<ClassAiAnswer>(
        `/api/student/subjects/${subjectId}/ai/answers`,
        {
            method: "POST",
            body: JSON.stringify({ question }),
        },
    );
}

export function listTeacherClassPosts(classId: string): Promise<ClassPost[]> {
    return requestJson<ClassPost[]>(`/api/teacher/classes/${classId}/posts`);
}

export function listStudentClassPosts(classId: string): Promise<ClassPost[]> {
    return requestJson<ClassPost[]>(`/api/student/classes/${classId}/posts`);
}

export function createClassPost(
    classId: string,
    input: { type: "NOTICE" | "POST"; title: string; body: string },
): Promise<ClassPost> {
    return requestJson<ClassPost>(`/api/teacher/classes/${classId}/posts`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}
