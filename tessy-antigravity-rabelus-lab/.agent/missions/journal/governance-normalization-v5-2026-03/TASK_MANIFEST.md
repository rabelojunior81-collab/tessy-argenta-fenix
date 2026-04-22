# TASK MANIFEST
**Missao:** governance-normalization-v5-2026-03
**Data:** 2026-03-17
**Executor:** Grok

---

## Tarefas Atômicas

### Fase 1: Single Source of Truth & Version Unification (P0)
- [ ] Criar `VERSION.md` com versão oficial, codename e data
- [ ] Atualizar `package.json` version para `5.0.1`
- [ ] Atualizar `README.md` (título, badges, versão)
- [ ] Atualizar `ARCHITECTURE.md` (título e data)
- [ ] Atualizar `CHANGELOG.md` com nova entrada de governança
- [ ] Atualizar versão no footer da UI (`App.tsx` ou componente equivalente)
- [ ] Buscar e corrigir todas as referências restantes de v4.9.1

### Fase 2: Governança para Open Source (P0)
- [ ] Criar `CONTRIBUTING.md` com padrões de commit, branch, PR
- [ ] Criar `CODE_OF_CONDUCT.md` (Contributor Covenant)
- [ ] Criar `LICENSE` (MIT ou AGPL-3.0 dependendo da decisão)
- [ ] Atualizar `.gitignore` se necessário
- [ ] Revisar e padronizar nomenclatura de pastas e arquivos
- [ ] Adicionar seção "Architecture Decision Records" em docs/adr/

### Fase 3: Limpeza e Marcação de Status
- [ ] Mapear todos os arquivos marcados como STUB, PARCIAL ou ÓRFÃO nas audits
- [ ] Adicionar comentário de status no topo dos arquivos críticos (`@status RESOLVIDO`, `@status PARCIAL`, etc.)
- [ ] Atualizar `audit-council-grok-2026-03-17.md` com status pós-missão
- [ ] Atualizar `RABELUS_LAB_GOVERNANCE_CANON.md` se necessário

### Fase 4: Verificação e Entrega
- [ ] Rodar `npm run typecheck`
- [ ] Rodar `npm run lint`
- [ ] Rodar `npm run build` (se aplicável)
- [ ] Preencher completamente `REPORT_TEMPLATE.md`
- [ ] Criar commit final com mensagem TSP

---

**Dependências:** Nenhuma (missão isolada de infra)
**Riscos:** Baixo (apenas documentos e versionamento)
**Status atual:** EM_EXECUCAO

*Última atualização: 2026-03-17*
