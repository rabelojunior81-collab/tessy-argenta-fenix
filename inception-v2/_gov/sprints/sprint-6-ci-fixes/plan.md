# Sprint 6 — CI Fixes: Plano Vivo

**Objetivo:** Corrigir todos os problemas identificados na auditoria molecular pós-PR#1.
**Status:** 🔄 ativo
**Branch:** `feat/gov-sprint-6` (criada a partir de `feat/gov-sprint-5`)
**Bloqueadores:** nenhum
**Bloqueia:** merge do PR#1 para main

---

## Origem dos Problemas

Auditoria pós-CI revelou que os jobs `lint-and-typecheck` e `test` nunca passaram em CI:

| ID  | Problema                                                                                                                               | Severidade              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| C1  | Artifact upload `packages/*/dist` não captura packages aninhados (channels/, providers/, tools/) — ESLint `import/no-unresolved` em CI | CRÍTICO                 |
| C2  | `@vitest/coverage-v8` ausente das devDependencies — `pnpm test:coverage` falha sem rodar 1 teste                                       | CRÍTICO                 |
| C3  | 4 testes com padrão "no error = success" sem verificar estado real                                                                     | SÉRIO                   |
| C4  | `moduleResolution: "bundler"` sem `paths` — resolvido ao corrigir C1                                                                   | INFO (dependente de C1) |

---

## Sub-sprints

| SS     | Nome                      | Resolve | Paralela?      |
| ------ | ------------------------- | ------- | -------------- |
| ss-6.1 | fix-ci-artifact-paths     | C1      | com 6.2        |
| ss-6.2 | add-coverage-dependency   | C2      | com 6.1        |
| ss-6.3 | strengthen-protocol-tests | C3      | depois 6.1+6.2 |
| ss-6.4 | final-validation          | —       | última         |

---

## Checklist de Conclusão Sprint 6

```
[ ] CI artifact: packages/channels/*/dist + providers/*/dist + tools/*/dist incluídos
[ ] @vitest/coverage-v8 em devDependencies do root package.json
[ ] pnpm test:coverage roda e 131+ testes passam
[ ] updateTaskStatus + addJournalEntry testam estado real (não apenas "no error")
[ ] pnpm build + lint + typecheck + test + test:coverage + audit → todos verdes
[ ] PR#1 atualizado ou novo PR para main
[ ] roadmap.md: Sprint 6 done, PR#1 atualizado
```

---

## Análise Técnica Detalhada

### C1 — Artifact path incompleto

**Estrutura atual do monorepo:**

```
packages/
├── core/dist/         ← capturado por packages/*/dist ✓
├── types/dist/        ← capturado ✓
├── config/dist/       ← capturado ✓
├── channels/
│   ├── cli/dist/      ← NÃO capturado ✗
│   ├── discord/dist/  ← NÃO capturado ✗
│   ├── http/dist/     ← NÃO capturado ✗
│   └── telegram/dist/ ← NÃO capturado ✗
├── providers/
│   └── anthropic/dist/ ← NÃO capturado ✗ (+ 11 outros)
└── tools/
    ├── browser/dist/   ← NÃO capturado ✗
    ├── filesystem/dist/ ← NÃO capturado ✗
    └── ...
```

**Fix:**

```yaml
- name: Upload dist artifact
  uses: actions/upload-artifact@v4
  with:
    name: dist
    path: |
      packages/*/dist
      packages/channels/*/dist
      packages/providers/*/dist
      packages/tools/*/dist
      apps/*/dist
    retention-days: 1
```

### C2 — Coverage dependency

`vitest run --coverage` requer `@vitest/coverage-v8` quando `provider: 'v8'` está configurado.

**Fix:** adicionar ao root `package.json`:

```json
"@vitest/coverage-v8": "^1.3.1"
```

### C3 — Testes fracos

`updateTaskStatus` não retorna valor — mas podemos verificar via `getActiveMissions()`:

```typescript
it('updates task status to in-progress', async () => {
  const mission = await protocol.createMission(baseConfig);
  const task = await protocol.addTask(mission.id, 'Task to update');
  await protocol.updateTaskStatus(mission.id, task.id, TaskStatus.InProgress);
  const [active] = await protocol.getActiveMissions();
  const updated = active.tasks.find((t) => t.id === task.id);
  expect(updated?.status).toBe(TaskStatus.InProgress);
});
```

`addJournalEntry` não retorna valor — mas `getJournal()` pode confirmar:
Não há método para buscar notas inline (só getJournal que retorna JournalEntry de archiveMission).
Solução: verificar via arquivamento que o entry foi criado, ou aceitar que nota é fire-and-forget.
Verificar a API real antes de decidir.
