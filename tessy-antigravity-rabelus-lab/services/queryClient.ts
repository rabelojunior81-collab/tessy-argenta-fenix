/**
 * TanStack Query — QueryClient singleton — Tessy v4.9.1
 * TDP §5: Contrato de feature
 *   - Armazenamento: memória (in-process) — cache por TTL, sem persistência em IDB
 *   - Runtime: thread principal
 *   - Falha: staleTime garante que dados cached sempre retornam mesmo offline
 *   - Gap resolvido: GitHub API rate limit (#2) — respostas cacheadas por 5 min
 *
 * USO:
 *   import { queryClient } from '../services/queryClient';
 *   // Envolver App com <QueryClientProvider client={queryClient}>
 *
 * Invalidação manual:
 *   queryClient.invalidateQueries({ queryKey: ['github', repoPath] });
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // GitHub API: cache por 5 minutos (stale), revalida em background
      staleTime: 5 * 60 * 1000,
      // Dados retidos em cache por 10 minutos após inatividade
      gcTime: 10 * 60 * 1000,
      // Não retentar em erro 404 ou 401 (rate limit / auth)
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
