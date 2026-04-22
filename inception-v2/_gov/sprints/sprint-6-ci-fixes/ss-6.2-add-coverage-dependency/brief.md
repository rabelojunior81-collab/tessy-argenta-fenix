# Brief — ss-6.2: add-coverage-dependency

**Status:** ⏳ pending
**Resolve:** C2 — pnpm test:coverage falha sem rodar 1 teste
**Paralela com:** ss-6.1

---

## Problema

O job `test` do CI executa `pnpm test:coverage` (= `vitest run --coverage`).
Vitest exige `@vitest/coverage-v8` quando `coverage.provider: 'v8'` está configurado.

O package **não está instalado**:

```bash
$ pnpm test:coverage
MISSING DEPENDENCY Cannot find dependency '@vitest/coverage-v8'
ELIFECYCLE  Command failed with exit code 1.
```

**Consequência:** Desde que o workflow foi criado (Sprint 3), o job `test` **nunca
executou um único teste em CI**. Falha em ~12 segundos antes de rodar qualquer teste.

## Packages afetados

Todos os `vitest.config.ts` têm:

```typescript
coverage: {
  provider: 'v8',
  ...
}
```

Pacotes: protocol, core, config, memory, agent, security, tools/filesystem.

## Fix

Root `package.json` — adicionar à seção `devDependencies`:

```json
"@vitest/coverage-v8": "^1.3.1"
```

Depois: `pnpm install` para atualizar o lockfile.

## Verificação

```bash
pnpm test:coverage  # deve rodar todos os testes e gerar cobertura
```

## Critério de Aceite

- `@vitest/coverage-v8` em root `package.json` devDependencies
- `pnpm test:coverage` termina com exit code 0
- Cobertura gerada em `coverage/`
