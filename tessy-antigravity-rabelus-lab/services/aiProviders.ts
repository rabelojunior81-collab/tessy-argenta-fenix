/**
 * AI Providers — Abstraction Layer Multi-Provider — Tessy v4.9.1
 * TDP §5: Contrato de feature
 *   - Armazenamento: nenhum — stateless
 *   - Runtime: browser (fetch)
 *   - IA: provider-agnostic via Vercel AI SDK
 *   - Permissões: network + API keys (VITE_GEMINI_API_KEY, VITE_ANTHROPIC_API_KEY)
 *   - Falha: se provider indisponível, cai para fallback (Gemini flash-lite)
 *
 * TDP §6: IA com transparência operacional
 *   - Entrada: prompt + provider selecionado
 *   - Transformação: AI SDK unifica a interface (generateText, streamText)
 *   - Saída: string | ReadableStream
 *   - Fallback: Gemini flash-lite (mais rápido, menor custo)
 *
 * STATUS TDP: STUB — abstraction layer preparada, integração com ChatContext
 * pendente em missão dedicada.
 *
 * VISÃO: A Tessy poderá usar Claude para raciocínio complexo e Gemini para
 * STT/multimodal simultaneamente, via abstraction layer unificada.
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, type LanguageModel, streamText } from 'ai';

export type TessyProvider =
  | 'gemini-flash'
  | 'gemini-pro'
  | 'gemini-flash-lite'
  | 'claude-sonnet'
  | 'claude-haiku';

const PROVIDER_MAP: Record<TessyProvider, () => LanguageModel> = {
  'gemini-flash': () => {
    const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    return google('gemini-2.0-flash');
  },
  'gemini-pro': () => {
    const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    return google('gemini-2.5-pro');
  },
  'gemini-flash-lite': () => {
    const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    return google('gemini-2.0-flash-lite');
  },
  'claude-sonnet': () => {
    const anthropic = createAnthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY });
    return anthropic('claude-sonnet-4-6');
  },
  'claude-haiku': () => {
    const anthropic = createAnthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY });
    return anthropic('claude-haiku-4-5-20251001');
  },
};

/**
 * Gera texto de forma síncrona (não-streaming).
 * Use para intents curtos, classificações e respostas estruturadas.
 */
export async function generateWithProvider(
  provider: TessyProvider,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const model = PROVIDER_MAP[provider]();
  const { text } = await generateText({
    model,
    prompt,
    system: systemPrompt,
  });
  return text;
}

/**
 * Streaming de texto.
 * Use para respostas longas do CoPilot (substitui service.ts iterativo).
 */
export async function streamWithProvider(
  provider: TessyProvider,
  prompt: string,
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const model = PROVIDER_MAP[provider]();
  const { textStream } = streamText({
    model,
    prompt,
    system: systemPrompt,
  });

  let fullText = '';
  for await (const chunk of textStream) {
    fullText += chunk;
    onChunk?.(chunk);
  }
  return fullText;
}

export { generateText, streamText };
