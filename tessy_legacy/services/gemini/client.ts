import { GoogleGenAI } from "@google/genai";
import { getToken, setToken } from "../authProviders";

// MAR 2026 TESSERACT MODEL CONFIGURATION
export const MODEL_FLASH = 'gemini-3-flash-preview';   // Frontier-class performance (Preview)
export const MODEL_PRO = 'gemini-3.1-pro-preview';     // Advanced intelligence + agentic (Preview)
export const MODEL_LITE = 'gemini-2.5-flash-lite';     // Fastest & most budget-friendly (Stable)

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
