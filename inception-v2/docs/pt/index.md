# Inception Framework v2.0 — Documentação

> **Idioma:** Português do Brasil (pt-BR) — idioma padrão do projeto
> **Versão:** 2.0.0

---

## O que é o Inception Framework?

O Inception Framework é um runtime TypeScript-nativo para agentes de IA autônomos.
Ele fornece:

- **Sistema de Missões** — criação, rastreamento e persistência de missões e tarefas em SQLite
- **Canais de Comunicação** — Telegram, Discord, CLI (bidirecional)
- **Ferramentas** — filesystem, browser (Playwright), memory, bash, fetch
- **Segurança** — gates de aprovação, rate limiting, filesystem policy, bearer tokens
- **Providers de LLM** — Anthropic, OpenAI, Gemini, Ollama, OpenRouter e mais

## Leitura Recomendada

| Documento                                                     | Descrição                                                  |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| [GUIA.md](../GUIA.md)                                         | Guia completo: instalação, configuração, uso e referências |
| [missions/mission-system.md](../missions/mission-system.md)   | Arquitetura detalhada do sistema de missões                |
| [decisions/provider-stubs.md](../decisions/provider-stubs.md) | ADR: providers implementados e planejados                  |

## Estrutura de Packages

```
inception-v2/
├── packages/
│   ├── types/          # @rabeluslab/inception-types     — contratos TypeScript
│   ├── core/           # @rabeluslab/inception-core      — runtime, lifecycle
│   ├── config/         # @rabeluslab/inception-config    — loader, defaults
│   ├── protocol/       # @rabeluslab/inception-protocol  — missões, SQLite
│   ├── security/       # @rabeluslab/inception-security  — gates, autenticação
│   ├── channels/       # canais: telegram, discord, cli
│   ├── providers/      # LLM providers: anthropic, openai, gemini, ollama...
│   └── tools/          # ferramentas: filesystem, browser, memory, bash, fetch
└── apps/
    └── cli/            # @rabeluslab/inception — CLI principal
```

## Links Externos

- [Repositório](https://github.com/rabeluslab/inception-v2)
- [npm: @rabeluslab/inception-types](https://www.npmjs.com/package/@rabeluslab/inception-types)
- [Governança do projeto](_gov/roadmap.md) — rastreamento de gaps e sprints

---

Para documentação em outros idiomas: [English](../en/index.md) · [Español](../es/index.md) · [中文](../zh/index.md)
