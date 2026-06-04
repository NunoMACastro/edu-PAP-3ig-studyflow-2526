import { AppShell } from "../components/layout/AppShell.js";
import { User } from "../lib/apiClient.js";
import { ProfilePage } from "../pages/student/ProfilePage.js";
import { RoutinesPage } from "../pages/student/RoutinesPage.js";
import { SoloStudyDashboard } from "../pages/student/SoloStudyDashboard.js";
import { StudyRoomsPage } from "../pages/student/StudyRoomsPage.js";
import { StudyAreaDetailPage } from "../pages/student/StudyRoomsDetailPage.js";
import { StudyAreaMaterialsPage } from "../pages/student/StudyRoomsMaterialsPage.js";
import { StudyHistoryPage } from "../pages/student/StudyHistoryPage.js";
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
    if (pathname === "/app/areas") return <StudyRoomsPage />;
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
