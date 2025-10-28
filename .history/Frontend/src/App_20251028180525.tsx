// src/App.tsx
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/routes.tsx";
import Sidebar from "./pages/Profissional/Dashboard/Sidebar.tsx";
import { NotificacoesProvider } from "./api/barraNotificacao/NotificacoesProvider.tsx";
import { AuthProvider } from "./contexts/AuthProvider";

export default function App() {
  const location = useLocation();

  console.log("App.tsx - Rota atual:", location.pathname);

  // Rotas públicas que não devem mostrar o sidebar
  const publicRoutes = ["/", "/login", "/register"];

  // Rotas protegidas que devem mostrar sidebar
  const isProfissionalRoute = location.pathname.startsWith("/profissional");
  const isResponsavelRoute = location.pathname.startsWith("/responsavel");
  const isOldDashboard = location.pathname === "/dashboard"; // Compatibilidade

  const shouldShowSidebar =
    !publicRoutes.includes(location.pathname) &&
    (isProfissionalRoute || isResponsavelRoute || isOldDashboard);

  return (
    <AuthProvider>
      <NotificacoesProvider position="top-right">
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar só aparece em rotas protegidas */}
          {shouldShowSidebar && <Sidebar />}

          {/* Conteúdo principal */}
          <div className={shouldShowSidebar ? "flex-1" : "w-full"}>
            <AppRoutes />
          </div>
        </div>
      </NotificacoesProvider>
    </AuthProvider>
  );
}
