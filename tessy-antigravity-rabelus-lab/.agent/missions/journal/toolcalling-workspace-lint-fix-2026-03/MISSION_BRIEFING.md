# MISSION BRIEFING
## ID: toolcalling-workspace-lint-fix-2026-03
## Status: EM_EXECUCAO
## Data: 2026-03-18
## Executor: Claude Sonnet 4.6

## Objetivo
Resolver três problemas identificados após sessão de agentes externos:
1. Tool Calling da onisciência da Tessy quebrado (CRÍTICO)
2. WorkspaceContext: TypeError ao carregar git ops (MÉDIO)
3. Lint: 4129 erros não resolvidos pela missão anterior (MÉDIO)

## Contexto
Agentes externos (OpenCode/Kimi) executaram missões entre 2026-03-10 e 2026-03-18.
A missão zero-lint-sanitization falhou (biome format ≠ biome check --write).
O Tessy CoPilot não consegue executar workspace tools — Gemini tenta chamar
como código Python em vez de function calling da API.

## Branch
feature/toolcalling-workspace-lint-fix-2026-03
