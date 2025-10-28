// ATUALIZADO PARA TRABALHAR COM COOKIES SEGUROS
import { api } from "../api/httpClient";

export async function login(email: string, senha: string) {
  const response = await api.post("/auth/login", {
    email,
    password: senha,
  });
  return response.data;
}

export async function register(nome: string, email: string, senha: string, tipo: string) {
  const response = await api.post("/users", {
    name: nome,
    email,
    password: senha,
    tipo: tipo.toUpperCase(),
  });
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data.user;
}
