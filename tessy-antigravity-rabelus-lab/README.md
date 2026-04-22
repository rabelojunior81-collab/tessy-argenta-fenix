# Tessy Antigravity — Rabelus Lab (v5.0.3)

**Versão Oficial:** 5.0.3
**Status:** Fase 1 concluída
**Última Atualização:** 2026-04-21

> **Agentes:** leia [`AGENT_PRIMER.md`](AGENT_PRIMER.md) antes de qualquer ação neste repositório.

---

## Sobre

A Tessy é um ambiente de desenvolvimento local-first assistido por IA, pensado para trabalho técnico intenso sem depender de uma nuvem central para a experiência principal.

A fundação da Fase 1 agora cobre o fluxo essencial:

- editor Monaco e terminal xterm.js lado a lado
- viewers roteados por URL com sincronização via History API
- autosave com switch no header do editor
- aviso explícito para arquivos grandes, com escolha entre modo normal e modo seguro
- terminal PTY real com conexão manual e scrollback persistido
- Monaco com workers locais e tema próprio

---

## Como Iniciar

```bash
npm install
npm run dev
# em outro terminal
npm run terminal
```

Ou, para subir os dois serviços juntos:

```bash
npm start
```

---

## Fluxos Principais

- `Files` abre arquivos locais do workspace. Arquivos grandes pedem confirmação antes de abrir.
- `GitHub Sync` lê arquivos remotos em modo somente leitura.
- `Terminal` inicia offline e conecta manualmente ao broker local quando você pede.
- `History`, `Library` e `Projects` continuam como viewers leves, sem recarregar a aplicação inteira.

---

## Documentação

- [`docs/guides/getting-started.md`](docs/guides/getting-started.md)
- [`docs/guides/development.md`](docs/guides/development.md)
- [`docs/guides/testing.md`](docs/guides/testing.md)
- [`docs/guides/configuration.md`](docs/guides/configuration.md)
- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## Validação da Fase 1

Os comandos usados para validar a fundação nesta fase foram:

```bash
npm run typecheck
npm run test
npm run e2e -- --grep "smoke|foundation"
```

---

**Este projeto segue o [Canon de Governança do Rabelus Lab](.agent/protocols/CANON.md).**

Todas as contribuições devem seguir o `CONTRIBUTING.md`.
