import axios from 'axios'

import { api } from '../../../api/apiClient'

const INVALID_TOKEN_CODE = 'INVALID_PASSWORD_RESET_TOKEN'

export type PasswordResetRequest = {
  token: string
  newPassword: string
}

export type PasswordResetResponse = {
  message: string
}

type ApiErrorResponse = {
  code?: string
}

export type PasswordResetErrorKind = 'invalid-token' | 'unavailable'

export class PasswordResetError extends Error {
  readonly kind: PasswordResetErrorKind

  constructor(kind: PasswordResetErrorKind) {
    super(kind)
    this.name = 'PasswordResetError'
    this.kind = kind
  }
}

export interface PasswordResetGateway {
  resetPassword(request: PasswordResetRequest): Promise<PasswordResetResponse>
}

export const passwordResetService: PasswordResetGateway = {
  async resetPassword(request) {
    try {
      const response = await api.post<PasswordResetResponse>(
        '/auth/password/reset',
        request,
      )
      return response.data
    } catch (error: unknown) {
      if (
        axios.isAxiosError<ApiErrorResponse>(error) &&
        error.response?.data?.code === INVALID_TOKEN_CODE
      ) {
        throw new PasswordResetError('invalid-token')
      }

      throw new PasswordResetError('unavailable')
    }
  },
}
