import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IEmbeddingProvider } from '@rabeluslab/inception-types';

const MODEL = 'gemini-embedding-2-preview';
const DIMENSIONS = 3072;

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  readonly id = 'gemini-embedding-2';
  readonly dimensions = DIMENSIONS;

  private client: GoogleGenerativeAI | undefined;

  initialize(apiKey: string): void {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async embed(text: string): Promise<Float32Array> {
    if (!this.client) {
      throw new Error('GeminiEmbeddingProvider not initialized');
    }
    const model = this.client.getGenerativeModel({ model: MODEL });
    const response = await model.embedContent(text);
    return new Float32Array(response.embedding.values);
  }

  async embedBatch(texts: readonly string[]): Promise<Float32Array[]> {
    if (!this.client) {
      throw new Error('GeminiEmbeddingProvider not initialized');
    }
    const results: Float32Array[] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}
