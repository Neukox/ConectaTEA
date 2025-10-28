/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // adicione aqui outras variáveis que você tiver no .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
