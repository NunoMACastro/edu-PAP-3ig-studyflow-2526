import { AppShell } from "../components/layout/AppShell.js";
import { User } from "../lib/apiClient.js";
import { TeacherAiVoicePage } from "../pages/teacher/TeacherAiVoicePage.js";
import { TeacherClassesPage } from "../pages/teacher/TeacherClassesPage.js";
import { TeacherClassPostsPage } from "../pages/teacher/TeacherClassPostsPage.js";
import { TeacherOfficialMaterialsPage } from "../pages/teacher/TeacherOfficialMaterialsPage.js";
import { TeacherSubjectsPage } from "../pages/teacher/TeacherSubjectsPage.js";
import { AdaptiveLearningPage } from "../pages/student/AdaptiveLearningPage.js";
import { ProfilePage } from "../pages/student/ProfilePage.js";
import { RoomAiPage } from "../pages/student/RoomAiPage.js";
import { RoomSharesPage } from "../pages/student/RoomSharesPage.js";
import { RoutinesPage } from "../pages/student/RoutinesPage.js";
import { SoloStudyDashboard } from "../pages/student/SoloStudyDashboard.js";
import { StudentClassAiPage } from "../pages/student/StudentClassAiPage.js";
import { StudentClassPostsPage } from "../pages/student/StudentClassPostsPage.js";
import { StudentClassSubjectsPage } from "../pages/student/StudentClassSubjectsPage.js";
import { StudentClassesPage } from "../pages/student/StudentClassesPage.js";
import { StudyAreasPage } from "../pages/student/StudyAreasPage.js";
import { StudyAreaDetailPage } from "../pages/student/StudyAreaDetailPage.js";
import { StudyAreaMaterialsPage } from "../pages/student/StudyAreaMaterialsPage.js";
import { StudyHistoryPage } from "../pages/student/StudyHistoryPage.js";
import { StudyRoomsPage } from "../pages/student/StudyRoomsPage.js";
import { StudyToolsPage } from "../pages/student/StudyToolsPage.js";

type ProtectedRoutesProps = {
    user: User;
    onLogout: () => Promise<void>;
};

/**
 * Resolve a página protegida a partir do `window.location.pathname`.
 *
 * @param pathname Caminho atual do browser.
 * @returns Elemento React da página correspondente.
 */
function resolveProtectedPage(pathname: string) {
    const roomAiMatch = pathname.match(/^\/app\/salas\/([^/]+)\/ia$/);
    if (roomAiMatch) {
        return <RoomAiPage roomId={roomAiMatch[1]} />;
    }

    const roomSharesMatch = pathname.match(/^\/app\/salas\/([^/]+)$/);
    if (roomSharesMatch) {
        return <RoomSharesPage roomId={roomSharesMatch[1]} />;
    }

    const studentClassPostsMatch = pathname.match(/^\/app\/turmas\/([^/]+)\/publicacoes$/);
    if (studentClassPostsMatch) {
        return <StudentClassPostsPage classId={studentClassPostsMatch[1]} />;
    }

    const studentClassSubjectsMatch = pathname.match(/^\/app\/turmas\/([^/]+)\/disciplinas$/);
    if (studentClassSubjectsMatch) {
        return <StudentClassSubjectsPage classId={studentClassSubjectsMatch[1]} />;
    }

    const classAiMatch = pathname.match(/^\/app\/disciplinas\/([^/]+)\/ia$/);
    if (classAiMatch) {
        return <StudentClassAiPage subjectId={classAiMatch[1]} />;
    }

    const teacherClassSubjectsMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/disciplinas$/);
    if (teacherClassSubjectsMatch) {
        return <TeacherSubjectsPage classId={teacherClassSubjectsMatch[1]} />;
    }

    const teacherClassPostsMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/publicacoes$/);
    if (teacherClassPostsMatch) {
        return <TeacherClassPostsPage classId={teacherClassPostsMatch[1]} />;
    }

    const teacherMaterialsMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/materiais$/);
    if (teacherMaterialsMatch) {
        return <TeacherOfficialMaterialsPage subjectId={teacherMaterialsMatch[1]} />;
    }

    const teacherVoiceMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/voz$/);
    if (teacherVoiceMatch) {
        return <TeacherAiVoicePage subjectId={teacherVoiceMatch[1]} />;
    }

    const adaptiveMatch = pathname.match(/^\/app\/areas\/([^/]+)\/adaptativo$/);
    if (adaptiveMatch) {
        return <AdaptiveLearningPage studyAreaId={adaptiveMatch[1]} />;
    }

    const materialMatch = pathname.match(/^\/app\/areas\/([^/]+)\/materiais$/);
    if (materialMatch) {
        return <StudyAreaMaterialsPage studyAreaId={materialMatch[1]} />;
    }

    const toolsMatch = pathname.match(/^\/app\/areas\/([^/]+)\/ferramentas$/);
    if (toolsMatch) {
        return <StudyToolsPage studyAreaId={toolsMatch[1]} />;
    }

    const areaMatch = pathname.match(/^\/app\/areas\/([^/]+)$/);
    if (areaMatch) {
        return <StudyAreaDetailPage studyAreaId={areaMatch[1]} />;
    }

    if (pathname === "/app/perfil") return <ProfilePage />;
    if (pathname === "/app/rotinas") return <RoutinesPage />;
    if (pathname === "/app/historico") return <StudyHistoryPage />;
    if (pathname === "/app/areas") return <StudyAreasPage />;
    if (pathname === "/app/salas") return <StudyRoomsPage />;
    if (pathname === "/app/turmas") return <StudentClassesPage />;
    if (pathname === "/app/professor/turmas") return <TeacherClassesPage />;
    return <SoloStudyDashboard />;
}

/**
 * Renderiza páginas protegidas dentro da shell comum.
 *
 * @param props Utilizador autenticado e logout.
 * @returns Página protegida atual.
 */
export function ProtectedRoutes({ user, onLogout }: ProtectedRoutesProps) {
    return (
        <AppShell user={user} onLogout={onLogout}>
            {resolveProtectedPage(window.location.pathname)}
        </AppShell>
    );
}
