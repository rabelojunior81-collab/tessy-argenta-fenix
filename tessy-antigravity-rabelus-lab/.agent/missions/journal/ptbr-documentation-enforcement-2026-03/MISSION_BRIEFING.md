# MISSION BRIEFING
## ID: ptbr-documentation-enforcement-2026-03
## Status: AGUARDANDO_EXECUCAO
## Data de Criação: 2026-03-18
## Criado por: Claude Sonnet 4.6 (sessão de planejamento)
## Prioridade: ALTA
## Branch: feature/ptbr-documentation-enforcement-2026-03

---

## 1. CONTEXTO E MOTIVAÇÃO

**Evento gerador:** Adilson revisou o repositório após o merge do PR #3 (`repo-sanitization-governance-2026-03`) e identificou que a **Regra de Ouro da Língua Portuguesa do Brasil** foi sistematicamente descumprida nos arquivos criados naquela missão.

**Problema identificado:**

Durante a missão de sanitização (2026-03-18), vários arquivos de documentação e scripts foram criados inteiramente em inglês. Isso viola a regra fundamental do projeto — toda documentação, comentários de código, mensagens de saída de scripts e arquivos de governança devem ser escritos em **Português do Brasil (pt-BR)**.

**Arquivos afetados identificados:**
- `README.md` — seções "About", "Current Architecture", "Getting Started", "Development" em inglês
- `scripts/release.mjs` — JSDoc e todos os comentários inline em inglês
- `scripts/validate-version.mjs` — JSDoc e todos os comentários inline em inglês

**Observação:** `AGENT_PRIMER.md` e `.agent/protocols/VERSIONING.md` já estão majoritariamente em PT-BR — revisar para garantir que não há trechos residuais em inglês.

**A Regra de Ouro NÃO está registrada formalmente em nenhum protocolo.** Isso é a causa raiz: sem enforcement escrito, qualquer agente novo comete o mesmo erro. Esta missão também resolve esse ponto.

**Esta missão NÃO inclui:** alteração de código de produto (components/, services/, contexts/, hooks/, App.tsx, index.html, index.tsx, types.ts, index.css).

---

## 2. A REGRA DE OURO (registrar em todos os protocolos)

> **Toda documentação, comentários de código, strings de saída de scripts, mensagens de erro/sucesso e arquivos de governança deste repositório devem ser escritos em Português do Brasil (pt-BR), sem exceção.**
>
> Exceções permitidas (apenas):
> - Nomes de variáveis, funções, classes e identificadores de código (snake_case/camelCase técnico)
> - Strings de API, chaves JSON e campos técnicos que interagem com sistemas externos
> - Termos técnicos sem tradução consolidada (ex: "commit", "branch", "merge", "lint", "codename")
> - Código de produto React/TypeScript (comentários em código de produto podem ser em inglês se já estiverem assim — não alterar código de produto)

---

## 3. ARQUIVOS A CORRIGIR

### Grupo A — Scripts (comentários)

| Arquivo | Problema | Ação |
|---------|----------|------|
| `scripts/release.mjs` | JSDoc completo + todos os `// ---` em inglês | Traduzir para pt-BR |
| `scripts/validate-version.mjs` | JSDoc completo + todos os `// ---` em inglês | Traduzir para pt-BR |

### Grupo B — Documentação

| Arquivo | Problema | Ação |
|---------|----------|------|
| `README.md` | Seções "About", "Current Architecture", "Getting Started", "Development" em inglês | Traduzir seções para pt-BR |
| `AGENT_PRIMER.md` | Revisar residuais em inglês | Auditoria + correção |
| `.agent/AGENT_PRIMER.md` | Espelho do anterior | Sincronizar com raiz |
| `.agent/protocols/VERSIONING.md` | Revisar residuais | Auditoria + correção |

### Grupo C — Inscrever a Regra de Ouro nos protocolos

| Arquivo | Ação |
|---------|------|
| `AGENT_PRIMER.md` | Adicionar seção explícita "REGRA DE OURO — LÍNGUA" |
| `.agent/AGENT_PRIMER.md` | Espelho |
| `.agent/protocols/TDP.md` | Adicionar a regra na seção de princípios não-negociáveis |
| `.agent/protocols/TMP.md` | Adicionar verificação de língua como gate de auditoria |

---

## 4. METODOLOGIA OBRIGATÓRIA — TSP

```bash
# Pre-flight
git status          # deve retornar working tree clean
git branch          # deve estar em main
git checkout -b feature/ptbr-documentation-enforcement-2026-03
```

Commits atômicos por grupo:
```bash
git commit -m "TSP: [A1] scripts/release.mjs — comentários para pt-BR"
git commit -m "TSP: [A2] scripts/validate-version.mjs — comentários para pt-BR"
git commit -m "TSP: [B1] README.md — tradução para pt-BR"
git commit -m "TSP: [B2] AGENT_PRIMER.md — tradução e Regra de Ouro"
git commit -m "TSP: [C1] TDP/TMP — Regra de Ouro pt-BR inscrita"
git commit -m "TSP: [Z1] fechamento missão ptbr-enforcement"
```

---

## 5. O QUE NÃO FAZER

- **NÃO tocar** código de produto: `components/`, `services/`, `contexts/`, `hooks/`, `App.tsx`, `index.html`, `index.tsx`, `types.ts`, `index.css`
- **NÃO alterar** a lógica dos scripts — apenas comentários e strings de saída
- **NÃO usar** `biome --unsafe`
- **NÃO mergear** sem aprovação de Adilson

---

## 6. GATES OBRIGATÓRIOS

| Gate | Critério | Método |
|------|----------|--------|
| G1 | TypeScript sem erros | `npx tsc --noEmit` → sem output |
| G5 | Versão consistente | `npm run validate-version` → exit 0 |
| G6 | Nenhum código de produto alterado | `git diff --name-only` lista só docs/, scripts/, .agent/ |
| G-LANG | Zero trechos em inglês nos arquivos listados | Grep manual + revisão |

---

## 7. CRITÉRIO DE ACEITE

A missão está CONCLUÍDA quando:
1. `scripts/release.mjs` — todos os comentários e strings de saída em pt-BR
2. `scripts/validate-version.mjs` — todos os comentários e strings de saída em pt-BR
3. `README.md` — inteiramente em pt-BR
4. `AGENT_PRIMER.md` (raiz e `.agent/`) — sem nenhum trecho em inglês
5. `AGENT_PRIMER.md` contém seção explícita "REGRA DE OURO — LÍNGUA"
6. `TDP.md` contém a Regra de Ouro na seção de princípios
7. `TMP.md` contém verificação de língua como gate de auditoria
8. `npx tsc --noEmit` → 0 erros
9. `npm run validate-version` → exit 0
10. PR aberto para revisão de Adilson

---

## 8. CONTEXTO TÉCNICO

**Branch de trabalho:** `feature/ptbr-documentation-enforcement-2026-03`
**Base:** `main` @ HEAD (pós-merge do PR #3)
**Versão atual:** 5.0.3

**Arquivos-chave:**
- `scripts/release.mjs` — 126 linhas, Node.js ESM
- `scripts/validate-version.mjs` — ~97 linhas, Node.js ESM
- `README.md` — ~60 linhas
- `AGENT_PRIMER.md` — ~120 linhas
- `.agent/protocols/TDP.md` — 412 linhas (adicionar seção)
- `.agent/protocols/TMP.md` — 334 linhas (adicionar gate)

---

## 9. HEURÍSTICAS PARA O EXECUTOR

1. **Leia cada arquivo completo** antes de editar — não editar às cegas
2. **Tradução ≠ reescrita** — manter o significado técnico preciso, só mudar o idioma
3. **Strings de console** (ex: `console.log('✅ ...')`) também traduzir
4. **Grep após edição** — verificar se ainda há frases em inglês: `grep -n "[a-zA-Z]" scripts/release.mjs | grep "// "` para checar comentários residuais
5. **Sincronizar espelhos** — AGENT_PRIMER.md raiz e .agent/ devem ser idênticos

---

## 10. PARA INICIAR NA PRÓXIMA SESSÃO

```
Role: Executor TMP
Missão: ptbr-documentation-enforcement-2026-03
Leia primeiro: .agent/missions/active/ptbr-documentation-enforcement-2026-03/MISSION_BRIEFING.md
Branch: feature/ptbr-documentation-enforcement-2026-03
Objetivo: Traduzir toda documentação para pt-BR + inscrever Regra de Ouro nos protocolos
```
