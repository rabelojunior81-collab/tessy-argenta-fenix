# ss-4.5 — cleanup-provider-enum (G3, G5)

**Status:** ✅ done
**Gaps:** G3 (`sandbox: 'none'` sem implementação) e G5 (9 ProviderId sem pacote)
**Branch:** `feat/gov-sprint-4`

## Problema

O enum `ProviderId` em `packages/types/src/providers.ts` contém 9 entradas sem pacote
correspondente. Qualquer consumidor que tente usar esses providers receberá `undefined`
em runtime — sem nenhuma indicação em tempo de compilação.

Da mesma forma, `ExecutionPolicy.sandbox` aceita `'docker'` e `'vm'` que nunca foram
implementados — o único valor funcional é `'none'`.

## O que foi feito

### G5 — ProviderId @future

Adicionado JSDoc `@future` aos 9 providers sem pacote:
`Groq`, `Together`, `Fireworks`, `Perplexity`, `Cohere`, `Mistral`, `XAI`, `DeepSeek`, `Custom`

O JSDoc inclui:

- `@future` — sinaliza que não está implementado
- `@see docs/decisions/provider-stubs.md` — link para a decisão arquitetural

### G3 — ExecutionPolicy.sandbox @unimplemented

Adicionado JSDoc `@unimplemented` aos valores `'docker'` e `'vm'` do campo `sandbox`
em `ExecutionPolicy` (`packages/types/src/security.ts`).

Documenta que apenas `'none'` é funcional hoje, e que docker/vm são futuros planejados.

### docs/decisions/provider-stubs.md (novo)

Documento arquitetural explicando:

- Por que os 9 providers existem no enum sem implementação
- Quais são os 9 providers planejados e seus status
- Como implementar um novo provider (referência ao padrão)
- Critérios de priorização para implementações futuras

## Arquivos modificados

- `packages/types/src/providers.ts` — JSDoc `@future` em 9 entradas do enum
- `packages/types/src/security.ts` — JSDoc `@unimplemented` em `sandbox`
- `docs/decisions/provider-stubs.md` (novo) — decisão arquitetural

## Verificação

`pnpm build` deve compilar sem erros (JSDoc não quebra TypeScript).
