# ADR: Provider Stubs no Enum `ProviderId`

**Data:** 2026-03-26
**Status:** Aceito
**Autores:** Rabelus Lab
**Sprint:** Sprint 4 — ss-4.5

---

## Contexto

O `enum ProviderId` em `packages/types/src/providers.ts` contém 9 entradas que não
têm um pacote de provider correspondente (`packages/provider-<slug>/`). Elas foram
adicionadas ao enum no design inicial do framework para reservar os slugs e garantir
type-safety futura — mas as implementações foram deliberadamente adiadas para manter
o scope da v2.0 gerenciável.

---

## Decisão

Manter os 9 stubs no enum com documentação explícita (`@future` JSDoc), em vez de
remover as entradas ou criar pacotes vazios. Razões:

1. **Reserva de slug** — garante que futuras implementações usem o mesmo identificador
   sem breaking changes na API pública.
2. **Type-safety** — código que recebe um `ProviderId` de uma config pode exibir
   erros ou fallbacks adequados para valores `@future`.
3. **Scope** — implementar todos os 9 providers na v2.0 estenderia o projeto
   indefinidamente. Os 13 providers já implementados cobrem os casos de uso reais
   do Rabelus Lab.

---

## Providers Implementados (13)

| ProviderId     | Pacote                            | Status      |
| -------------- | --------------------------------- | ----------- |
| `openai`       | `inception-provider-openai`       | ✅ Completo |
| `anthropic`    | `inception-provider-anthropic`    | ✅ Completo |
| `gemini`       | `inception-provider-gemini`       | ✅ Completo |
| `gemini-oauth` | `inception-provider-gemini-oauth` | ✅ Completo |
| `openai-oauth` | `inception-provider-openai-oauth` | ✅ Completo |
| `ollama`       | `inception-provider-ollama`       | ✅ Completo |
| `kimi`         | `inception-provider-kimi`         | ✅ Completo |
| `zai`          | `inception-provider-zai`          | ✅ Completo |
| `bailian`      | `inception-provider-bailian`      | ✅ Completo |
| `openrouter`   | `inception-provider-openrouter`   | ✅ Completo |
| `kilo`         | `inception-provider-kilo`         | ✅ Completo |
| `opencode-zen` | `inception-provider-opencode-zen` | ✅ Completo |

---

## Providers Stub (9) — `@future`

| ProviderId   | Slug         | Prioridade | Motivo do adiamento                               |
| ------------ | ------------ | ---------- | ------------------------------------------------- |
| `Groq`       | `groq`       | Alta       | Inferência ultra-rápida (LPU). OpenAI-compatible. |
| `Together`   | `together`   | Média      | Open-source models via Together AI.               |
| `Fireworks`  | `fireworks`  | Média      | Fine-tuning + deployment de modelos customizados. |
| `Perplexity` | `perplexity` | Média      | LLM com busca em tempo real integrada.            |
| `Cohere`     | `cohere`     | Baixa      | Especialista em RAG e embeddings enterprise.      |
| `Mistral`    | `mistral`    | Média      | Modelos open-weight europeus (GDPR-friendly).     |
| `XAI`        | `xai`        | Baixa      | Grok models — API ainda instável.                 |
| `DeepSeek`   | `deepseek`   | Alta       | Modelos R1/V3 com excelente custo-benefício.      |
| `Custom`     | `custom`     | N/A        | Bring-your-own-endpoint. Requer design de config. |

---

## Como implementar um novo provider

1. Criar `packages/provider-<slug>/` copiando a estrutura de `packages/provider-anthropic/`
2. Implementar a interface `IProvider` de `@rabeluslab/inception-types`
3. Remover o JSDoc `@future` do enum em `packages/types/src/providers.ts`
4. Adicionar o provider ao `model-registry.ts` em `packages/config/`
5. Documentar no README e CHANGELOG
6. Adicionar testes de integração (mocked)

---

## Sobre `ExecutionPolicy.sandbox`

Os valores `'docker'` e `'vm'` no campo `sandbox` de `ExecutionPolicy` seguem a
mesma lógica: reserva de API futura. Apenas `'none'` está implementado hoje.
Configurar `'docker'` ou `'vm'` não tem efeito prático na v2.0.

Rastreado como **G3** em `_gov/roadmap.md`.
