import { GoogleGenAI } from '@google/genai';
import { getToken, setToken } from '../authProviders';

// Verificado em 2026-03-17 via https://ai.google.dev/gemini-api/docs/models
// TESSY SAFETY PROTOCOL: Modelos estáveis como default, preview apenas como opção

// Modelos Estáveis (Stable) - Default para produção
export const MODEL_STABLE_FLASH = 'gemini-2.5-flash';
export const MODEL_STABLE_PRO = 'gemini-2.5-pro';
export const MODEL_STABLE_FLASH_LITE = 'gemini-2.5-flash-lite';

// Modelo com suporte a imagens (visão) - para quando o usuário anexa imagens
export const MODEL_VISION = 'gemini-2.5-pro'; // Pro suporta visão multimodal

// Modelos Preview (podem ser descontinuados)
export const MODEL_FLASH_PREVIEW = 'gemini-3-flash-preview';
export const MODEL_PRO_PREVIEW = 'gemini-3.1-pro-preview';
export const MODEL_FLASH_LITE_PREVIEW = 'gemini-3.1-flash-lite-preview';

// Aliases para compatibilidade retroativa
export const MODEL_FLASH = MODEL_STABLE_FLASH;
export const MODEL_PRO = MODEL_STABLE_PRO;
export const MODEL_LITE = MODEL_STABLE_FLASH_LITE;

/**
 * Helper para obter configuração de modelo
 * TDP §8: Transparência de IA - declarar fonte e fallback
 */
export const getModelConfig = (modelId?: string) => {
  const model = modelId || MODEL_STABLE_FLASH;

  const configs: Record<
    string,
    { type: 'stable' | 'preview'; reasoning: boolean; description: string }
  > = {
    [MODEL_STABLE_FLASH]: {
      type: 'stable',
      reasoning: true,
      description: 'Best price-performance for low-latency, high-volume tasks',
    },
    [MODEL_STABLE_PRO]: {
      type: 'stable',
      reasoning: true,
      description: 'Most advanced model for complex tasks',
    },
    [MODEL_STABLE_FLASH_LITE]: {
      type: 'stable',
      reasoning: false,
      description: 'Fastest and most budget-friendly multimodal model',
    },
    [MODEL_FLASH_PREVIEW]: {
      type: 'preview',
      reasoning: true,
      description: 'Frontier-class performance - may be deprecated',
    },
    [MODEL_PRO_PREVIEW]: {
      type: 'preview',
      reasoning: true,
      description: 'Advanced intelligence and complex problem-solving',
    },
    [MODEL_FLASH_LITE_PREVIEW]: {
      type: 'preview',
      reasoning: false,
      description: 'Frontier-class performance at fraction of cost',
    },
  };

  return configs[model] || configs[MODEL_STABLE_FLASH];
};

/**
 * Recupera o token Gemini da Central de Autenticação unificada.
 */
export const getGeminiToken = async (): Promise<string | null> => {
  try {
    return await getToken('gemini');
  } catch (err) {
    console.error('Falha na recuperação do token Gemini:', err);
    return null;
  }
};

/**
 * Grava o token Gemini via Central de Autenticação (Redirecionamento).
 */
export const setGeminiToken = async (token: string): Promise<void> => {
  await setToken('gemini', token);
};

export const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};
