# Governance Status Map (Post Audit)

**Auditoria:** auditoria-holistica-opencode-2026-03-18  
**Data:** 2026-03-18  
**Auditor:** OpenCode (Kimi k2p5)  
**Status Geral:** Transição Controlada — Governança Ativa

---

## Resumo Executivo

O projeto completou a fase de **consolidação de protocolos** com aprovação do Rabelus Council. O sistema de missões TSP/TMP está operacional, mas camadas modernas permanecem órfãs. Duas novas missões foram criadas para sanitização técnica antes da integração das camadas órfãs.

---

## Status por Componente

### Camadas Integradas (✅ RESOLVIDO)

| Componente | Status | Observação |
|-----------|--------|------------|
| AutoDoc | ✅ **RESOLVIDO** | Firecrawl integrado, cascata funcionando |
| FileSystem Omniscient | ✅ **RESOLVIDO** | isomorphic-git com Buffer polyfills |
| Firecrawl Auth Center | ✅ **RESOLVIDO** | UI dinâmica com templates |
| Mission Protocol | ✅ **RESOLVIDO** | TSP/TMP implementados e operacionais |

### Camadas Órfãs (⚠️ PARCIAL)

| Componente | Status | Impacto | Missão Relacionada |
|-----------|--------|---------|-------------------|
| `cryptoService.ts` | ⚠️ **PARCIAL** | Tokens em plaintext | Futura (P0) |
| `aiProviders.ts` | ⚠️ **PARCIAL** | ChatContext usa Gemini nativo | Futura (P1) |
| `server/index.hono.ts` | ⚠️ **STUB** | Express 5 RC ainda ativo | Futura (P2) |

### Débito Técnico Crítico (🔴 SLOBS)

| Problema | Severidade | Missão Designada | Status |
|-----------|------------|------------------|--------|
| 4108 erros Biome | 🔴 **P0** | `zero-lint-sanitization-2026-03` | AGUARDANDO_EXECUCAO |
| Zero testes unitários | 🔴 **P0** | `tdd-first-suite-2026-03` | AGUARDANDO_EXECUCAO |
| WorkspaceContext God Object | 🟡 **P1** | — | BACKLOG |
| UI de Ações Duplicada | 🟡 **P1** | — | BACKLOG |

---

## Barramento de Missões — Estado Atual

### Missões Ativas (AGUARDANDO_EXECUCAO)

| Sprint ID | Tipo | Prioridade | Executor | Objetivo |
|-----------|------|------------|----------|----------|
| `zero-lint-sanitization-2026-03` | Sanitização | P0 | — | Limpar 4108 erros Biome |
| `tdd-first-suite-2026-03` | Fundação | P0 | — | Primeira suite de testes |

### Missões Concluídas (ARQUIVADAS em journal/)

| Sprint ID | Data Fim | Executor | Resultado |
|-----------|----------|----------|-----------|
| `tdp-viewer-persistence-broker-terminal-2026-03` | 2026-03-10 | Codex GPT-5 | ✅ Broker terminal + viewer persistence |
| `autodoc-gemini-url-context-2026-03` | 2026-03-17 | — | ✅ AutoDoc funcional com Firecrawl |
| `firecrawl-auth-integration-2026-03` | 2026-03-17 | — | ✅ Templates dinâmicos no Auth Center |

---

## Roadmap para v5.1 (Consolidação)

### Fase 1: Sanitização (Semana 1)
1. ✅ **Documentação** — Auditoria OpenCode registrada
2. ✅ **Arquivamento** — Limpeza do bus (Archivist)
3. 🔄 **Zero-Lint** — Executar `zero-lint-sanitization-2026-03`
4. ⏳ **TDD** — Executar `tdd-first-suite-2026-03`

### Fase 2: Integração (Semanas 2-3)
5. ⏳ **Multi-LLM** — Decoupling ChatContext → aiProviders.ts
6. ⏳ **Security** — Reativar cryptoService.ts
7. ⏳ **Docs** — Atualizar README para v5.1

---

## Convenções de Governança

### Estrutura de Branches
- **Ativas:** `feature/[sprint-id]` — durante execução
- **Finalizadas:** Merge para `main` com `--no-ff`
- **Arquivadas:** Nunca modificar `missions/journal/`

### Commits
- Prefixo obrigatório: `TSP: [TASK-ID] descrição`
- Commits de arquivamento: `TSP: [ARQUIVO] sprint-id arquivada`
- Commits de conclusão: `TSP: [MISSAO COMPLETA] sprint-id`

### Gates Obrigatórios (TDP)
- G1: `npx tsc --noEmit` — Zero erros TypeScript
- G2: Persistência — Validar leitura/escrita
- G3: Segurança — Revisar tokens e permissões
- G4: UX/Smoke — `npm run start` funcional
- G5: Release — CHANGELOG.md atualizado
- G6: IA — Documentar transformações

---

## Referências

- **Auditoria Atual:** `docs/auditoria-holistica-opencode-2026-03-18.md`
- **Auditoria Council:** `docs/audit-council-grok-2026-03-17.md`
- **Protocolo TSP:** `.agent/TESSY_DEV_PROTOCOL.md`
- **Protocolo TMP:** `.agent/MISSION_PROTOCOL.md`
- **Histórico Completo:** `.agent/MISSION_PROTOCOL.md` (Seção 8)

---

*Documento atualizado automaticamente em 2026-03-18*  
*Conforme TESSY DEV PROTOCOL v1.0*
