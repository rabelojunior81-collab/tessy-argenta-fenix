/**
 * Firecrawl Service — Tessy v4.9.1
 * TDP §5: Contrato de feature
 *   - Armazenamento: nenhum local — resultados retornados para o AutoDoc Scheduler
 *   - Runtime: browser (fetch) ou broker Node (para CORS)
 *   - IA: não aplicável nesta camada
 *   - Permissões: network (externa) — requer FIRECRAWL_API_KEY
 *   - Falha: se API key ausente ou rate limit, retorna null sem lançar exceção
 *   - Gap resolvido: AutoDoc CORS-protected targets (#1)
 *
 * TDP §6: IA com transparência operacional
 *   - Entrada: URL do target
 *   - Transformação: Firecrawl → markdown estruturado
 *   - Saída: string markdown | null
 *
 * NOTA: Para uso durante desenvolvimento (CLI), instalar globalmente:
 *   npm install -g firecrawl-cli && firecrawl login --api-key fc-YOUR-KEY
 */
import FirecrawlApp from '@mendable/firecrawl-js';
import { getToken } from './authProviders';

let _client: FirecrawlApp | null = null;
let _currentApiKey: string | null = null;

async function getClient(): Promise<FirecrawlApp | null> {
  const apiKey = await getToken('firecrawl');

  if (!apiKey) {
    _client = null; // Invalida cliente antigo se a chave for removida
    _currentApiKey = null;
    return null;
  }

  // Se a chave mudou, recria o cliente
  if (!_client || apiKey !== _currentApiKey) {
    _client = new FirecrawlApp({ apiKey });
    _currentApiKey = apiKey;
  }

  return _client;
}

/**
 * Scraping de URL com fallback gracioso.
 * Resolve o gap #1 do AutoDoc: targets CORS-protected retornavam vazio.
 * O Firecrawl opera server-side — sem restrições de CORS.
 *
 * @param url URL pública a ser scrapeada
 * @returns Markdown do conteúdo principal, ou null em caso de falha
 */
export async function scrape(url: string): Promise<string | null> {
  const client = await getClient();

  if (!client) {
    // Retorna null silenciosamente se a chave não estiver configurada.
    // O log amarelo foi removido para não poluir o console no caso de fallback esperado.
    return null;
  }

  try {
    const result = await client.scrape(url, {
      formats: ['markdown'],
    });

    return result.markdown ?? null;
  } catch (error) {
    console.warn(`[FirecrawlService] Erro ao scrape ${url}:`, error);
    return null;
  }
}
