/**
 * MSW server — Node.js (para testes Vitest/Node).
 * TDP §5: Contrato — runtime: Node (não browser).
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
