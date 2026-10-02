// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { getDefaultRoute } from "../config/routes";
import { useNotificacoesContext } from "../api/barraNotificacao";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();
  const { notificarSucesso, notificarErro } = useNotificacoesContext();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(email, senha);
      setUser(data.user)
      
      notificarSucesso(
        'Login realizado!',
        `Bem-vindo(a), ${data.user.name}!`,
        { duration: 3000 }
      );
      
      // Redireciona baseado no tipo de usuário usando a configuração de rotas
      const redirectTo = getDefaultRoute(data.user.tipo);
      navigate(redirectTo);
    } catch (err) {
      console.error("Erro no login:", err);
      notificarErro(
        'Erro no login',
        'Email ou senha incorretos. Tente novamente.',
        { duration: 5000 }
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo + Título */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-green-600 text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl font-bold">
          C
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">ConectaTEA</h1>
        <p className="text-gray-600 max-w-sm mt-1">
          Bem-vindo de volta! Acesse sua conta para continuar a jornada de apoio
          e crescimento.
        </p>
      </div>

      {/* Card de Login */}
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold text-center text-gray-900">Entrar</h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Acesse sua conta ConectaTEA
        </p>

        <form onSubmit={handleSubmit}>
          {/* Campo Email */}
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Email
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12H8m8 0l-4 4m4-4l-4-4m0 8a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none text-sm"
              required
            />
          </div>

          {/* Campo Senha */}
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Senha
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-2 .896-2 2zm0 0v4m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full outline-none text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              {mostrarSenha ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Esqueceu a senha */}
          <div className="text-right mb-4">
            <a
              href="#"
              className="text-green-600 text-sm hover:underline font-medium"
            >
              Esqueceu sua senha?
            </a>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Entrar
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">ou</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Criar conta */}
        <button
          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
          type="button"
          onClick={() => navigate("/register")}
        >
          Criar nova conta
        </button>
      </div>

      {/* Rodapé */}
      <p className="text-center text-gray-500 text-sm mt-6 max-w-sm">
        Sua jornada de apoio começa aqui. Juntos, podemos fazer a diferença.
      </p>
    </div>
  );
}
