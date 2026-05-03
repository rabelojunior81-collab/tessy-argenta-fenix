# Arquivo de Arqueologia — Fase 4.1

Esta pasta preserva a memória histórica da Fase 4.1 após o rollback completo de 2026-04-30.

## Conteúdo

- `04.1-CONTEXT.md` — contexto original da fase.
- `04.1-RESEARCH.md` — pesquisa e decisões de base.
- `04.1-AI-SPEC.md` / `04.1-UI-SPEC.md` — contratos que orientaram a execução.
- `04.1-01` a `04.1-07` — planos e summaries executados na fase.
- `HOTFIX-04.1.md` — hotfix de compilação registrado como evidência histórica.
- `04.1-POST-MORTEM.md` — relato forense do erro, do rollback e do estado final.

## Estado canônico atual

- O módulo `tessy-antigravity-rabelus-lab` foi revertido para o pré-04.1.
- O superproject foi sincronizado para apontar esse estado.
- O hook de `post-commit` foi corrigido para encaminhar argumentos corretamente.

## Regra de uso

Trate os arquivos desta pasta como snapshots históricos. Novas conclusões devem ser registradas no post-mortem ou nos docs canônicos do root, não reescrevendo os artefatos congelados.
