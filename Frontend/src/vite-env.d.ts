/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_DEV_BYPASS_AUTH?: string
  readonly VITE_DEV_USER_ROLE?: string
  // adicione aqui outras variáveis que você tiver no .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
