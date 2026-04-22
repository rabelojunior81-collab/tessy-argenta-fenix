export { GeminiEmbeddingProvider } from './gemini.js';
export { OllamaEmbeddingProvider } from './ollama.js';

import type { IEmbeddingProvider, MemoryConfig } from '@rabeluslab/inception-types';

import { GeminiEmbeddingProvider } from './gemini.js';
import { OllamaEmbeddingProvider } from './ollama.js';

export function createEmbeddingProvider(config: MemoryConfig): IEmbeddingProvider | undefined {
  if (!config.embeddingModel) return undefined;

  if (
    config.embeddingModel.includes('embeddinggemma') ||
    config.embeddingModel.startsWith('ollama:')
  ) {
    const model = config.embeddingModel.startsWith('ollama:')
      ? config.embeddingModel.slice(7)
      : config.embeddingModel;
    return new OllamaEmbeddingProvider(undefined, model, config.embeddingDimensions);
  }

  if (config.embeddingModel.includes('gemini-embedding')) {
    const provider = new GeminiEmbeddingProvider();
    // apiKey resolved externally and passed via initialize()
    return provider;
  }

  return undefined;
}
