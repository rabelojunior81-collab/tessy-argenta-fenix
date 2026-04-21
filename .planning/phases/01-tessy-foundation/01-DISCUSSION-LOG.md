# Phase 1: Tessy Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 01-tessy-foundation
**Areas discussed:** Layout editor + terminal, Sessao do terminal, Politica de salvamento, Arquivos grandes, Navegacao SPA, Limite da fundacao

---

## Layout editor + terminal

| Option | Description | Selected |
|--------|-------------|----------|
| Manter layout atual | Terminal dockado embaixo como base da experiencia | ✓ |
| Redesenhar layout | Mudar a relacao editor/terminal ja na fundacao | |

**User's choice:** Manter o layout atual com terminal dockado na parte inferior.
**Notes:** O usuario validou explicitamente o comportamento atual como norte da fase.

---

## Sessao do terminal

| Option | Description | Selected |
|--------|-------------|----------|
| Manual | Usuario conecta explicitamente quando quiser | ✓ |
| Auto-conectar | Terminal tenta abrir sessao automaticamente | |

**User's choice:** Manter o terminal como esta hoje, com conexao manual.
**Notes:** A fundacao deve preservar o modelo atual de controle explicito da sessao.

---

## Politica de salvamento

| Option | Description | Selected |
|--------|-------------|----------|
| Autosave obrigatorio | Sempre ligado, sem opcao de desligar | |
| Autosave padrao com switch | Ligado por padrao, mas ajustavel no proprio editor | ✓ |
| Salvar apenas manualmente | Usuario salva sempre por acao explicita | |

**User's choice:** Autosave como padrao, mas nao travado; expor switch coeso no header do editor.
**Notes:** O usuario citou header do editor e tambem modal de salvamento como possibilidades, mas aprovou a ideia de uma opcao direta e pertinente na propria experiencia de edicao.

---

## Arquivos grandes

| Option | Description | Selected |
|--------|-------------|----------|
| Abrir direto | Nao avisar, manter abertura automatica | |
| Avisar e deixar escolher | Mostrar aviso antes de abrir e deixar o usuario decidir | ✓ |
| Modo degradado automatico | Forcar comportamento seguro sem escolha | |

**User's choice:** Avisar e deixar escolher.
**Notes:** A discussao travou o principio de agencia do usuario; detalhes finais do aviso podem ser decididos na implementacao.

---

## Navegacao SPA

| Option | Description | Selected |
|--------|-------------|----------|
| Estado interno puro | Sem rotas semanticas, apenas estado React/localStorage | |
| Rotas leves por viewer | URL representa views principais, sem enderecamento completo de arquivo | ✓ |
| Enderecamento completo | URL representa projeto, viewer e arquivo aberto | |

**User's choice:** `5=2`, adotando rotas leves por viewer.
**Notes:** A explicacao comparou SPA por estado interno, rotas leves e enderecamento completo; o usuario escolheu a opcao intermediaria para nao antecipar complexidade das fases seguintes.

---

## Limite da fundacao

| Option | Description | Selected |
|--------|-------------|----------|
| Local-first como base oficial | Workspace local e caminho principal da fase | ✓ |
| Local + GitHub em igualdade | Tratar ambos como contrato central da fundacao | |
| GitHub como eixo central | Puxar fortemente o remoto para dentro da fase | |

**User's choice:** `6 ok`, aprovando a recomendacao de local-first como base oficial da fundacao.
**Notes:** GitHub pode permanecer como compatibilidade passiva e auxiliar, mas a integracao completa continua reservada para a Phase 3.

---

## the agent's Discretion

- Limiar numerico para o aviso de arquivo grande
- Schema exato das rotas leves de viewer
- Microcopy e persistencia do switch de autosave
- Opcoes finais do aviso de arquivo grande

## Deferred Ideas

Nenhuma — a discussao permaneceu dentro do escopo da Phase 1.
