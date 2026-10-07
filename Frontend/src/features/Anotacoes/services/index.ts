import { MockAnotacoesGateway } from './MockAnotacoesGateway'
import { ApiAnotacoesGateway } from './ApiAnotacoesGateway'

export type { AnotacoesGateway } from './AnotacoesGateway'
export { MockAnotacoesGateway }
export { ApiAnotacoesGateway }

const useMockGateway =
  import.meta.env.DEV &&
  import.meta.env.VITE_DEV_USE_MOCK_ANNOTATIONS === 'true'

export const anotacoesGateway = useMockGateway
  ? new MockAnotacoesGateway()
  : new ApiAnotacoesGateway()
