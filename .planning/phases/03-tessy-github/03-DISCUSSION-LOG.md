# Phase 3: Tessy GitHub - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 03-tessy-github
**Areas discussed:** Authentication GitHub, Token persistence, Repository navigation, Git operations, Scope of connection, Worktree behavior

---

## Authentication GitHub

| Option | Description | Selected |
|--------|-------------|----------|
| OAuth como único caminho | Login por GitHub OAuth/PKCE, sem PAT na UX principal. | |
| OAuth + fallback PAT | OAuth como padrão, mas manter PAT manual como saída de emergência. | ✓ |
| PAT primeiro | Manter o fluxo atual e tratar OAuth só como evolução interna. | |

**User's choice:** OAuth + fallback PAT
**Notes:** OAuth é o caminho principal; PAT manual fica como fallback.

---

## Token persistence

| Option | Description | Selected |
|--------|-------------|----------|
| sessionStorage apenas | Segue o requisito da fase, com o token vivendo só na aba atual. | |
| sessionStorage + refresh silencioso | Token curto na sessão e renovação automática quando expirar. | |
| Sessão do app | Guardar só o estado de login e buscar token quando precisar. | ✓ |

**User's choice:** Relaxar a exigência de `sessionStorage` nesta fase
**Notes:** O usuário pediu para não entrar no mérito agora e tratar essa direção em outro momento. A fase não deve travar a persistência em `sessionStorage`.

---

## Repository navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Árvore expansível | Explora pastas e arquivos em hierarquia, parecido com o viewer atual. | |
| Lista com busca | Prioriza encontrar rápido por nome/caminho, com menos foco em árvore visual. | |
| Híbrido | Árvore para navegação normal e busca global para saltar direto ao arquivo. | ✓ |

**User's choice:** Híbrido
**Notes:** Árvore para orientar, busca para acelerar.

---

## Git operations

| Option | Description | Selected |
|--------|-------------|----------|
| Só ler | Navegar repositório e abrir arquivos, sem mutação pela UI. | |
| Leitura + ações guiadas | Navegar, abrir arquivo, criar branch, commitar e abrir PR com confirmação explícita. | ✓ |
| Leitura + ações diretas | Além de navegar, fazer commit/push/branch com pouca fricção na interface. | ✓ |

**User's choice:** Ações guiadas e diretas
**Notes:** O usuário quer um switch `YOLO` para distinguir entre comportamento guiado e direto, conforme a intenção do usuário.

---

## Scope of connection

| Option | Description | Selected |
|--------|-------------|----------|
| Conta global | Uma conexão GitHub vale para o app inteiro, independente do projeto aberto. | |
| Projeto ativo | Cada projeto do Tessy pode ter seu próprio repo GitHub associado. | |
| Ambos | Existe uma conexão global, mas o projeto ativo pode sobrescrever com um repo específico. | ✓ |

**User's choice:** Ambos
**Notes:** Além disso, o usuário quer sistema de `worktree` disponível no próprio fluxo GitHub, para que agentes humanos e IA criem branches, desenvolvam e façam merge.

---

## Worktree behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Automático por branch | Criar um worktree sempre que houver branch nova ou ação de desenvolvimento. | |
| Sob demanda | Worktree aparece como opção no fluxo de ação, só quando o usuário pedir. | |
| Misturado | Ações guiadas usam worktree como padrão, mas o usuário pode desligar isso no switch `YOLO`. | ✓ |

**User's choice:** Misturado
**Notes:** O worktree deve estar disponível como capacidade do GitHub, com suporte explícito para branches, desenvolvimento e merge.

---

## the agent's Discretion

- A forma exata do refresh do tree/repo após ações Git.
- Microcopy exata dos modais de GitHub.

## Deferred Ideas

- Persistência do token em `sessionStorage` como contrato rígido foi relaxada nesta fase para acomodar uma direção futura diferente.

