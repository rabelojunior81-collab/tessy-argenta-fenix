# Brief — ss-6.3: strengthen-protocol-tests

**Status:** ⏳ pending
**Resolve:** C3 — testes fracos "no error = success"
**Depois de:** ss-6.1 + ss-6.2

---

## Problema

4 testes em `packages/protocol/src/mission-protocol.test.ts` usam o padrão
"no error = success" — não verificam se o estado foi realmente alterado.

### Testes afetados

**updateTaskStatus (2 testes — linhas 157-169):**

```typescript
it('updates task status to in-progress', async () => {
  // ...
  await protocol.updateTaskStatus(mission.id, task.id, TaskStatus.InProgress);
  // No error = success (updateTaskStatus doesn't return the updated task)
});
```

Problema: se `updateTaskStatus` silenciosamente não fizesse nada, o teste passaria.

**addJournalEntry (2 testes — linhas 183-196):**

```typescript
it('allows multiple notes for the same mission', async () => {
  await protocol.addJournalEntry(mission.id, 'Note 1');
  await protocol.addJournalEntry(mission.id, 'Note 2');
  // No error = success
});
```

Problema: notas podem não ter sido persistidas.

## Análise da API

**`updateTaskStatus`**: não retorna valor. Porém `getActiveMissions()` retorna a mission
com suas tasks incluídas. Fix: buscar a task após atualização e verificar o status.

**`addJournalEntry`**: não retorna valor e não há método para listar notas inline.
`getJournal()` retorna apenas missions arquivadas (JournalEntry de archiveMission).
Fix: verificar que `addJournalEntry` acumula contagem de notas ou usar outro approach.
→ Verificar `mission-protocol.ts` para ver se há campo `notes` na mission ou se notas
são guardadas em outra tabela.

## Fix Esperado

Para `updateTaskStatus`:

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

Para `addJournalEntry`: investigar a implementação real antes de decidir o fix.

## Critério de Aceite

- Todos os 4 testes têm pelo menos 1 `expect()` que verifica estado real
- Nenhum teste usa apenas "no error = success" como única verificação
- 131+ testes continuam passando (nenhuma regressão)
