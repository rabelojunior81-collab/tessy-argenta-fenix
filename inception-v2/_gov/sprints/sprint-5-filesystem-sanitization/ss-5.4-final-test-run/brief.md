# Brief — ss-5.4: final-test-run

**Status:** ⏳ pending
**Fase:** validação
**Paralela com:** depois de ss-5.1, ss-5.2, ss-5.3 (é a última)

---

## Objetivo

Executar o pipeline completo de qualidade e confirmar que tudo está verde antes
de abrir o PR para `main`.

## Comandos

```bash
pnpm build                    # 30/30 verde
pnpm lint                     # 0 errors
pnpm typecheck                # 0 errors
pnpm test                     # 131+ testes passando
pnpm audit --audit-level=high # 0 high/critical vulns
```

## Critério de Aceite

Todos os 5 comandos acima terminam com exit code 0.

## Pós-validação

Após validação verde:

1. Atualizar `_gov/roadmap.md` — Sprint 5 como `✅ done`, G9 como done
2. Criar handoff `_gov/bus/active/2026-03-26T{hora}-claude-claude-handoff-sprint5-done.md`
3. Commit final: `chore(gov): sprint-5 done — filesystem clean, G9 resolved`
4. Abrir PR: `feat/gov-sprint-5` → `main`
