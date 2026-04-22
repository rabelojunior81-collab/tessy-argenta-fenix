# Brief — ss-6.4: final-validation

**Status:** ⏳ pending
**Fase:** validação completa
**Depois de:** ss-6.1 + ss-6.2 + ss-6.3

---

## Objetivo

Pipeline completo verde, incluindo coverage.

## Comandos

```bash
pnpm build                    # 30/30 verde
pnpm lint                     # 0 errors
pnpm typecheck                # todos os packages passando
pnpm test                     # 131+ testes passando (turbo)
pnpm test:coverage            # testes com coverage, sem MISSING DEPENDENCY
pnpm audit --audit-level=high # 0 high/critical
```

## Critério de Aceite

Todos os 6 comandos terminam com exit code 0.

## Pós-validação

1. Atualizar `_gov/roadmap.md` — Sprint 6 done, PR atualizado
2. Criar handoff `_gov/bus/active/`
3. Commitar + push para `feat/gov-sprint-6`
4. Atualizar PR#1 (ou criar PR#2 de `feat/gov-sprint-6` → `main`)
