import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { useNotificacoesContext } from "../api/barraNotificacao";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipoUsuario: "",
  });
  const [loading, setLoading] = useState(false);
  const { notificarSucesso, notificarErro, notificarAlerta } = useNotificacoesContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.senha !== form.confirmarSenha) {
      notificarAlerta(
        'Senhas não coincidem',
        'As senhas digitadas não são iguais. Verifique e tente novamente.',
        { duration: 4000 }
      );
      return;
    }

    if (!form.tipoUsuario) {
      notificarAlerta(
        'Tipo de usuário obrigatório',
        'Selecione se você é um profissional ou responsável.',
        { duration: 4000 }
      );
      return;
    }

    setLoading(true);
    try {
      const response = await register(form.nome, form.email, form.senha, form.tipoUsuario);
      notificarSucesso(
        'Conta criada!',
        'Sua conta foi criada com sucesso. Redirecionando para login...',
        { duration: 4000 }
      );
      console.log(response);
      setTimeout(() => navigate("/login"), 2000); // Delay para mostrar a notificação
    } catch (error: any) {
      console.error("Erro no registro:", error);
      
      // Usar a mensagem específica do erro se disponível
      const errorMessage = error.message || 'Não foi possível criar sua conta. Verifique os dados e tente novamente.';
      
      notificarErro(
        'Erro no cadastro',
        errorMessage,
        { duration: 6000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Logo e título */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
          C
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">ConectaTEA</h1>
        <p className="text-center text-gray-600 max-w-sm">
          Crie sua conta para começar a transformar a vida das crianças autistas com amor e cuidado.
        </p>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Criar Conta</h2>
        <p className="text-center text-gray-600 mb-6">
          Junte-se à comunidade ConectaTEA
        </p>

        {/* Nome */}
        <label className="block mb-2 font-medium text-gray-700">Nome Completo</label>
        <input
          type="text"
          name="nome"
          placeholder="Seu nome completo"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {/* Email */}
        <label className="block mb-2 font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {/* Senha */}
        <label className="block mb-2 font-medium text-gray-700">Senha</label>
        <input
          type="password"
          name="senha"
          placeholder="********"
          value={form.senha}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {/* Confirmar Senha */}
        <label className="block mb-2 font-medium text-gray-700">Confirmar Senha</label>
        <input
          type="password"
          name="confirmarSenha"
          placeholder="********"
          value={form.confirmarSenha}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {/* Tipo de usuário */}
        <label className="block mb-2 font-medium text-gray-700">Tipo de Usuário</label>
        <select
          name="tipoUsuario"
          value={form.tipoUsuario}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Selecione o tipo de usuário</option>
          <option value="responsavel">Responsável (Pais/Cuidadores)</option>
          <option value="profissional">Profissional (Terapeutas/Psicólogos)</option>
        </select>

        {/* Botão Criar Conta */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>

        {/* Separador */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">ou</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Já tenho uma conta */}
        <button
          type="button"
          style={{
            width: '100%',
            backgroundColor: 'white',
            color: '#374151',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: '600',
            border: '1px solid #d1d5db',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '16px'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'white'}
          onClick={() => navigate("/login")}
        >
          Já tenho uma conta
        </button>
      </form>

      {/* Rodapé */}
      <p className="text-center text-gray-500 text-sm mt-6 max-w-xs">
        Sua jornada de apoio começa aqui. Juntos, podemos fazer a diferença.
      </p>
    </div>
  );
}
