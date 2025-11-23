# ConectaTEA

O **ConectaTEA** é uma plataforma projetada para conectar pessoas e profissionais relacionados ao TEA (Transtorno do Espectro Autista). Este projeto visa facilitar o acesso a informações, serviços e suporte para a comunidade.

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias principais:

- [React](https://react.dev/) - Biblioteca JavaScript para construção de interfaces de usuário.
- [TypeScript](https://www.typescriptlang.org/) - Superset do JavaScript que adiciona tipagem estática.
- [Vite](https://vitejs.dev/) - Ferramenta de build rápida e leve.
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário para estilização rápida.
- [Radix UI](https://www.radix-ui.com/) - Componentes acessíveis e sem estilo para construção de design systems.
- [Zod](https://zod.dev/) - Validação de esquemas TypeScript-first.
- [React Router](https://reactrouter.com/) - Roteamento declarativo para aplicações React.
- [Axios](https://axios-http.com/) - Cliente HTTP baseado em Promises.

## 🛠️ Como Iniciar

Siga as instruções abaixo para configurar e rodar o projeto localmente.

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina. Recomendamos o uso de um gerenciador de pacotes como o [pnpm](https://pnpm.io/).

### Instalação

1.  Clone o repositório:

    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd ConectaTEA/Frontend
    ```

2.  Instale as dependências:

    ```bash
    pnpm install
    ```

### Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

## 📜 Scripts Disponíveis

No diretório do projeto, você pode executar os seguintes comandos:

- `pnpm dev`: Inicia o servidor de desenvolvimento.
- `pnpm build`: Compila o projeto para produção.
- `pnpm lint`: Executa o ESLint para verificar problemas no código.
- `pnpm preview`: Visualiza a build de produção localmente.

## 📂 Estrutura do Projeto

A estrutura principal do diretório `src` é organizada da seguinte forma:

```
src/
├── api/          # Configurações e chamadas de API
├── assets/       # Imagens, ícones e outros arquivos estáticos
├── components/   # Componentes reutilizáveis da aplicação
├── config/       # Arquivos de configuração globais
├── contexts/     # Contextos do React (State Management)
├── hooks/        # Custom Hooks
├── layouts/      # Layouts de página (ex: MainLayout, AuthLayout)
├── lib/          # Funções utilitárias e configurações de bibliotecas (ex: utils.ts)
├── pages/        # Páginas da aplicação (Roteamento)
├── routes/       # Definições de rotas
├── services/     # Lógica de negócios e serviços
└── main.tsx      # Ponto de entrada da aplicação
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

Desenvolvido com 💙 para a comunidade.
