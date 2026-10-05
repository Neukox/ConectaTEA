import { MockAnotacoesGateway } from './MockAnotacoesGateway'

export type { AnotacoesGateway } from './AnotacoesGateway'
export { MockAnotacoesGateway }

export const anotacoesGateway = new MockAnotacoesGateway()
