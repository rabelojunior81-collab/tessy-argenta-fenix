import type { IEmbeddingProvider } from '@rabeluslab/inception-types';
import { Ollama } from 'ollama';

const DEFAULT_MODEL = 'embeddinggemma';
const DEFAULT_DIMENSIONS = 768;

export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  readonly id: string;
  readonly dimensions: number;

  private readonly client: Ollama;
  private readonly model: string;

  constructor(
    host = 'http://localhost:11434',
    model = DEFAULT_MODEL,
    dimensions = DEFAULT_DIMENSIONS
  ) {
    this.id = `ollama-${model}`;
    this.dimensions = dimensions;
    this.model = model;
    this.client = new Ollama({ host });
  }

  async embed(text: string): Promise<Float32Array> {
    const response = await this.client.embed({ model: this.model, input: [text] });
    return new Float32Array(response.embeddings[0]);
  }

  async embedBatch(texts: readonly string[]): Promise<Float32Array[]> {
    const response = await this.client.embed({ model: this.model, input: texts as string[] });
    return response.embeddings.map((vec: number[]) => new Float32Array(vec));
  }
}
