# MISSION BRIEFING
## Missao: Governance Normalization & Version Unification v5
**Missao ID:** `governance-normalization-v5-2026-03`
**Data de criacao:** 2026-03-17
**Criado por:** Grok (Council Auditor)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositorio:** `tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão foi gerada a partir do `audit-council-grok-2026-03-17.md` e das auditorias anteriores (Gemini, Kimi, Self-Audit, Sanitization Audit).

O projeto apresenta grave inconsistência de versionamento (v4.9.1 vs v5.0.1-toolchain vs 5.0.1-devmode), artefatos órfãos, documentação desatualizada e estrutura que não atende padrões modernos de projetos open-source.

**Objetivo principal:** Estabelecer Single Source of Truth, padronizar nomenclatura, organizar estrutura de arquivos e preparar o projeto para colaboração externa/open-source.

**Esta missao NAO inclui:** implementação de novas features, migração completa para Hono, testes unitários em massa ou mudanças de segurança (cryptoService).

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Processos envolvidos
- Frontend SPA (Vite + React + TypeScript)
- Documentação técnica
- Governança (.agent/)

### 2.2 Localizacao dos pontos criticos

| Ponto de Mudanca | Arquivo | Motivo |
|------------------|--------|--------|
| Versionamento | README.md, ARCHITECTURE.md, package.json | Inconsistência de versão |
| Documentação | docs/, CHANGELOG.md | Desatualizada |
| Estrutura | services/, contexts/, .agent/ | Nomenclatura e organização |

---

## 3. METODOLOGIA OBRIGATORIA — TESSY SAFETY PROTOCOL (TSP)

Todo o trabalho deve seguir o TSP sem exceção.

### 3.1 Pre-flight obrigatorio
```bash
git status
npm run typecheck
npm run lint
```

### 3.2 Commits atomicos
```bash
git commit -am "TSP: [GOV-001] <descricao concisa>"
```

### 3.3 Auditoria pos-merge
Verificar imports órfãos e referências inconsistentes.

---

## 4. REGRAS DE EXECUCAO

1. Toda alteração de versão deve ser atômica e refletida em todos os arquivos.
2. Usar nomenclatura clara e padrões internacionais (Conventional Commits, Semantic Versioning).
3. Criar CONTRIBUTING.md e CODE_OF_CONDUCT.md.
4. Atualizar CHANGELOG.md seguindo Keep a Changelog.
5. Sempre rodar `npm run typecheck && npm run lint` após mudanças.
6. Registrar status explícito (`RESOLVIDO` / `PARCIAL`) nos arquivos modificados.

---

## 5. CRITERIO DE SUCESSO DA MISSAO

A missão está completa quando:
- [ ] Single Source of Truth estabelecido (`package.json` + VERSION.md)
- [ ] Todas as menções de versão estão alinhadas em `5.0.1`
- [ ] README.md, ARCHITECTURE.md e CHANGELOG.md atualizados
- [ ] Novo `CONTRIBUTING.md` e `CODE_OF_CONDUCT.md` criados
- [ ] `npm run typecheck` e `npm run lint` passam
- [ ] `REPORT_TEMPLATE.md` completamente preenchido
- [ ] Estrutura de pastas revisada e documentada

---

## 6. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsavel |
|---------|-------|-----------|
| MISSION_BRIEFING.md | Este arquivo | Grok |
| TASK_MANIFEST.md | Tarefas atômicas | Grok |
| REPORT_TEMPLATE.md | Relatório final | Grok |
| COMMUNICATION_PROTOCOL.md | Regras de comunicação | Grok |

---

*Documento gerado seguindo Rabelus Lab Governance Canon.*
