/**
 * Sentry Observability Service — Tessy v4.9.1
 * TDP §5: Contrato de feature
 *   - Armazenamento: nenhum local — dados enviados para Sentry Cloud
 *   - Runtime: thread principal (browser)
 *   - IA: não aplicável
 *   - Permissões: nenhuma adicional (apenas network)
 *   - Falha: se SENTRY_DSN ausente, Sentry inicializa em modo noop (sem erros)
 *
 * TDP §3: Gate G3 (Segurança)
 *   - Sentry NÃO tem acesso a tokens de API, PTY sessions ou IndexedDB
 *   - beforeSend filtra dados sensíveis antes do envio
 *   - Habilitado apenas em produção (import.meta.env.PROD)
 */
import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  if (!dsn || !import.meta.env.PROD) {
    // Modo dev ou sem DSN — Sentry em noop, sem telemetria
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: `tessy@${import.meta.env.VITE_APP_VERSION ?? '4.9.1'}`,
    tracesSampleRate: 0.1,
    // TDP §3: filtra dados sensíveis antes de enviar
    beforeSend(event) {
      // Remove qualquer referência a tokens ou chaves de API das mensagens
      if (event.message?.match(/api[_-]?key|token|password|secret/i)) {
        return null;
      }
      return event;
    },
  });
}

/** Captura exceção manualmente com contexto adicional */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/** Wrapper de ErrorBoundary do Sentry para React */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
