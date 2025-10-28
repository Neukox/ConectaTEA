import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useRole = () => {
  const { user } = useAuth();
  return {
    isProfissional: user?.tipo === "PROFISSIONAL",
    isResponsavel: user?.tipo === "RESPONSAVEL",
    userType: user?.tipo,
  };
};
