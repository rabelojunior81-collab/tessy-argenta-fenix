# Brief — ss-6.1: fix-ci-artifact-paths

**Status:** ⏳ pending
**Resolve:** C1 — ESLint import/no-unresolved em CI
**Paralela com:** ss-6.2

---

## Problema

O job `lint-and-typecheck` do CI falha com 21 erros `import/no-unresolved`:

```
error  Unable to resolve path to module '@rabeluslab/inception-channel-cli'
error  Unable to resolve path to module '@rabeluslab/inception-provider-anthropic'
error  Unable to resolve path to module '@rabeluslab/inception-tool-filesystem'
... (+ 18 outros)
```

**Causa raiz:** O passo de upload do artifact usa `packages/*/dist`, que só captura
packages no nível raiz de `packages/`. Os packages aninhados em subdirektórios
(`channels/*/`, `providers/*/`, `tools/*/`) não são incluídos.

O `eslint-import-resolver-typescript` resolve `@rabeluslab/inception-channel-cli` via:

1. `node_modules/@rabeluslab/inception-channel-cli/` → symlink para `packages/channels/cli/`
2. `package.json` `exports` → `"types": "./dist/index.d.ts"`
3. `packages/channels/cli/dist/index.d.ts` → **não existe em CI** → erro

## Fix

`.github/workflows/ci.yml` — step "Upload dist artifact":

```yaml
# ANTES:
path: |
  packages/*/dist
  apps/*/dist

# DEPOIS:
path: |
  packages/*/dist
  packages/channels/*/dist
  packages/providers/*/dist
  packages/tools/*/dist
  apps/*/dist
```

## Verificação

Após o fix, verificar localmente que todos os paths existem:

```bash
ls packages/channels/cli/dist/index.d.ts      # deve existir
ls packages/providers/anthropic/dist/index.d.ts  # deve existir
ls packages/tools/filesystem/dist/index.d.ts  # deve existir
```

## Critério de Aceite

- Workflow atualizado com os 4 novos paths
- `pnpm lint` localmente: 0 errors (confirmar)
- CI lint job: deve passar após o fix
