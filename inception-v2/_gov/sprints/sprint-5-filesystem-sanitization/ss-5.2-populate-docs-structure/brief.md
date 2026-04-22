# Brief — ss-5.2: populate-docs-structure

**Status:** ⏳ pending
**Gap resolve:** G9
**Fase:** criação de arquivos
**Paralela com:** ss-5.1, ss-5.3, ss-5.4

---

## Objetivo

Criar a estrutura mínima de documentação i18n em `docs/`:

- `docs/pt/index.md` — documentação em português (conteúdo real, não stub)
- `docs/en/index.md` — documentação em inglês (conteúdo real, não stub)
- `docs/es/index.md` — stub "em breve"
- `docs/zh/index.md` — stub "em breve"

## Contexto

G9 identifica `docs/en/` e `docs/pt/` como diretórios vazios. O projeto tem toda
documentação escrita em português (`GUIA.md`, etc.) e inglês misturado. O objetivo
é criar uma landing page por idioma que centralize os links.

## Estrutura Esperada

```
docs/
├── GUIA.md                    (existente — documentação técnica em pt-BR)
├── audit-research/README.md   (existente — redirect)
├── decisions/
│   └── provider-stubs.md      (existente — ADR)
├── missions/
│   └── mission-system.md      (existente)
├── pt/
│   └── index.md               (CRIAR — links para GUIA.md, missions/, decisions/)
├── en/
│   └── index.md               (CRIAR — visão geral do framework em inglês)
├── es/
│   └── index.md               (CRIAR — stub: "Documentação em espanhol em breve")
└── zh/
    └── index.md               (CRIAR — stub: "中文文档即将推出")
```

## Conteúdo de `docs/pt/index.md`

- Título: Inception Framework v2.0 — Documentação
- Links para: GUIA.md, missions/mission-system.md, decisions/provider-stubs.md
- Nota sobre \_gov/ como fonte de verdade de governança

## Conteúdo de `docs/en/index.md`

- Título: Inception Framework v2.0 — Documentation
- Overview rápido do framework (o que é, arquitetura, packages)
- Links para: GUIA.md (note: currently in pt-BR), missions/, decisions/

## Critério de Aceite

- 4 arquivos criados (pt, en, es, zh)
- `docs/pt/index.md` e `docs/en/index.md` com conteúdo real (não apenas stubs)
- `pnpm build` continua verde após criação
