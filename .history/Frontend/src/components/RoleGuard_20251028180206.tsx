import { type ReactNode } from "react";
import { useRole } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("PROFISSIONAL" | "RESPONSAVEL")[];
  fallbackPath?: string;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
}: RoleGuardProps) => {
  const { userType } = useRole();

  if (!userType) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
