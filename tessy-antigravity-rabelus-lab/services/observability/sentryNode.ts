/**
 * Sentry Node — broker Express (server/index.ts)
 * TDP §5: Contrato
 *   - Runtime: Node.js (broker)
 *   - Captura: falhas de PTY spawn, sessões expiradas, erros de WebSocket
 *   - Habilitado apenas quando SENTRY_DSN está no ambiente do processo
 *
 * USO em server/index.ts:
 *   import { initSentryNode } from '../services/observability/sentryNode';
 *   initSentryNode(); // Chamar antes de qualquer handler Express
 */
import * as SentryNode from '@sentry/node';

export function initSentryNode(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  SentryNode.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  });
}

export { SentryNode };
