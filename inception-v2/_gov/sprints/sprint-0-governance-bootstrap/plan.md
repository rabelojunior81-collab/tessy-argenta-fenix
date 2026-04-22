# Sprint 0 — Governance Bootstrap: Plano Vivo

**Objetivo:** Criar a infraestrutura de governança. Sem ela, as sprints 1-5 não têm onde registrar artefatos, briefings, handoffs ou mensagens de bus.
**Status:** 🔄 in-progress
**Branch:** `feat/governance`
**Iniciada:** 2026-03-25
**Bloqueadores:** nenhum
**Bloqueia:** Sprint 1 (hard)

---

## Sub-sprints

| SS     | Nome                      | Status     | Commit                 |
| ------ | ------------------------- | ---------- | ---------------------- |
| ss-0.1 | research-filesystem-audit | ✅ done    | integrado ao bootstrap |
| ss-0.2 | create-gov-structure      | ✅ done    | —                      |
| ss-0.3 | archive-audits            | ⏳ pending | —                      |
| ss-0.4 | roadmap-initial           | ✅ done    | —                      |
| ss-0.5 | sync-memory-index         | ⏳ pending | —                      |
| ss-0.6 | commit-eslint-fix         | ⏳ pending | —                      |

---

## Progresso por SS

### ss-0.1 — research-filesystem-audit ✅

Pesquisa concluída por 3 agentes paralelos (Explore). Mapa definitivo do filesystem:

- 87% implementado (~19 packages reais, 3 stubs explícitos)
- 12 gaps identificados (G1-G12)
- Audits obsoletos em `docs/audit-research/` (2026-03-13 e 2026-03-16)
- Memórias Claude desatualizadas (dizem "8%")

Handoff integrado ao bootstrap — sem arquivo separado.

### ss-0.2 — create-gov-structure ✅

Criados:

- `_gov/governance-spec.md` — documento norte (10 seções)
- `_gov/roadmap.md` — roadmap vivo (sprints 0-5, gaps G1-G12)
- `_gov/sprints/sprint-0-governance-bootstrap/plan.md` — este arquivo
- `_gov/sprints/sprint-0-governance-bootstrap/ss-0.{1..6}/brief.md` — specs
- Stubs `plan.md` para sprints 1-5
- `.gitkeep` em bus/active, bus/archive, archive/audits, archive/docs-snapshots

### ss-0.3 — archive-audits ⏳

**Pendente.** Ver `ss-0.3-archive-audits/brief.md`.

Ações necessárias:

```bash
git mv docs/audit-research/codex-first-audit.md \
       _gov/archive/audits/2026-03-13-codex-first-audit.md
git mv docs/audit-research/claude-sonnet-audit-2026-03-16.md \
       _gov/archive/audits/2026-03-16-claude-sonnet-audit.md
# criar docs/audit-research/README.md com redirect
```

### ss-0.4 — roadmap-initial ✅

`_gov/roadmap.md` criado cobrindo sprints 0-5, gap tracking G1-G12.

### ss-0.5 — sync-memory-index ⏳

**Pendente.** Ver `ss-0.5-sync-memory-index/brief.md`.

Memórias a atualizar (externas ao repo):

- `C:\Users\rabel\.claude\projects\...\memory\project_inception_v2.md`
- `C:\Users\rabel\.claude\projects\...\memory\project_mission_system.md`
- `C:\Users\rabel\.claude\projects\...\memory\MEMORY.md`

### ss-0.6 — commit-eslint-fix ⏳

**Pendente.** Ver `ss-0.6-commit-eslint-fix/brief.md`.

Arquivo com mudança pendente: `.eslintrc.cjs` (override `no-console` para `apps/**`).
Branch alvo: `feat/mission-system`.

---

## Checklist de Conclusão Sprint 0

```
[x] _gov/ existe com estrutura completa
[x] _gov/governance-spec.md escrito (documento norte)
[x] _gov/roadmap.md escrito (roadmap vivo)
[x] _gov/sprints/sprint-0/ com plan.md e 6 briefs
[x] Stubs plan.md para sprints 1-5
[ ] _gov/archive/audits/ tem os 2 arquivos (git mv — ss-0.3)
[ ] docs/audit-research/ tem apenas README.md redirect (ss-0.3)
[ ] Memórias Claude atualizadas (ss-0.5)
[ ] .eslintrc.cjs commitado (ss-0.6)
[ ] pnpm build + lint → verde
[ ] git status limpo na branch feat/governance
```

---

## Próximas Ações Imediatas

1. Executar ss-0.3 (git mv dos audits)
2. Executar ss-0.5 (atualizar memórias Claude)
3. Executar ss-0.6 (commitar .eslintrc.cjs)
4. Commit final da estrutura `_gov/`
5. Atualizar `_gov/roadmap.md` com status final da Sprint 0
