# Inception Framework v2.0 — Documentation

> **Version:** 2.0.0
> **Primary language:** Portuguese (pt-BR) — see [docs/pt/index.md](../pt/index.md)

---

## What is the Inception Framework?

Inception Framework is a TypeScript-native runtime for autonomous AI agents.
It provides:

- **Mission System** — create, track and persist missions and tasks in SQLite
- **Communication Channels** — Telegram, Discord, CLI (bidirectional)
- **Tools** — filesystem, browser (Playwright), memory, bash, fetch
- **Security** — approval gates, rate limiting, filesystem policy, bearer tokens
- **LLM Providers** — Anthropic, OpenAI, Gemini, Ollama, OpenRouter and more

## Quick Start

```bash
npm install -g @rabeluslab/inception
inception init
inception start
```

## Recommended Reading

| Document                                                      | Description                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| [GUIA.md](../GUIA.md)                                         | Full guide (pt-BR): installation, configuration, usage and references |
| [missions/mission-system.md](../missions/mission-system.md)   | Mission system architecture                                           |
| [decisions/provider-stubs.md](../decisions/provider-stubs.md) | ADR: implemented and planned LLM providers                            |

## Package Architecture

```
inception-v2/
├── packages/
│   ├── types/          # @rabeluslab/inception-types     — TypeScript contracts
│   ├── core/           # @rabeluslab/inception-core      — runtime, lifecycle
│   ├── config/         # @rabeluslab/inception-config    — loader, defaults
│   ├── protocol/       # @rabeluslab/inception-protocol  — missions, SQLite
│   ├── security/       # @rabeluslab/inception-security  — gates, auth
│   ├── channels/       # channels: telegram, discord, cli
│   ├── providers/      # LLM providers: anthropic, openai, gemini, ollama...
│   └── tools/          # tools: filesystem, browser, memory, bash, fetch
└── apps/
    └── cli/            # @rabeluslab/inception — main CLI
```

## Key Design Decisions

- **node:sqlite** (Node.js 22+) for mission persistence — no external DB dependency
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, full strict mode
- **Gate system** — every tool declares a `GateType` (Security, Approval, etc.)
- **pnpm workspaces + Turbo** — monorepo with incremental builds
- **Husky + commitlint** — conventional commits enforced via pre-commit hooks

---

For other languages: [Português](../pt/index.md) · [Español](../es/index.md) · [中文](../zh/index.md)
