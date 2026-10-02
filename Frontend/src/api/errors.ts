import axios from 'axios'

interface ApiErrorBody {
  message?: string
  error?: string
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação.',
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || error.response?.data?.error || fallback
  }

  return error instanceof Error && error.message ? error.message : fallback
}
