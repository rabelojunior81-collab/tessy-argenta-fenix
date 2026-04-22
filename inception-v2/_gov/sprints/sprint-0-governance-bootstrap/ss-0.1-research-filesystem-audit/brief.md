---
id: ss-0.1
sprint: sprint-0-governance-bootstrap
fase: research
alvo: filesystem-audit
status: done
criado-em: 2026-03-25T00:00:00Z
branch: feat/governance
---

# Brief: Auditoria Completa do Filesystem

## Objetivo

Produzir um mapa definitivo do estado real do projeto — o que está implementado, o que são stubs, quais versões, quais gaps — para informar todas as sprints seguintes.

## Contexto

Sessão nova. Memórias Claude desatualizadas. HANDOFF.md diz "tudo implementado". Nenhum documento de estado existia. Era impossível iniciar qualquer sprint sem saber o que realmente existe.

## Scope

### Dentro:

- Varredura completa de `packages/`, `apps/`, `channels/`, `tools/`
- Identificação de stubs explícitos (arquivos com `export {}` ou sem implementação real)
- Leitura de todos os `package.json` (versão, nome, exports)
- Leitura de `package.json` raiz (scripts, workspaces, engines)
- Leitura de `.eslintrc.cjs`, `tsconfig.json`, `.github/workflows/ci.yml`
- Identificação de arquivos de auditoria obsoletos em `docs/`
- Comparação com memórias Claude existentes

### Fora:

- Leitura de código fonte linha-a-linha (escopo de Sprint 2)
- Auditoria de segurança profunda (coberta pelos packages de security)

## Spec Técnica

### Arquivos a criar:

- `_gov/sprints/sprint-0-governance-bootstrap/ss-0.1-research-filesystem-audit/brief.md` (este arquivo)
- `_gov/sprints/sprint-0-governance-bootstrap/ss-0.1-research-filesystem-audit/handoff.md`

### Arquivos a modificar: nenhum

### Arquivos a NÃO tocar: nenhum (só leitura)

## Validação

### Testes do Claude (automated):

- [x] Lista de todos os packages com status (completo/stub)
- [x] Lista de 12 gaps identificados (G1-G12)
- [x] Confirmação de versões nos package.json

### Testes do Usuário (manual):

- [x] Revisão do entendimento apresentado pelo Claude

## Commit Message

N/A — SS de pesquisa; artefatos integrados ao commit da ss-0.2.

## Definition of Done

- [x] Handoff.md com mapa definitivo do filesystem
- [x] 12 gaps identificados e documentados
- [x] Dados usados para criar `_gov/governance-spec.md` e `_gov/roadmap.md`
