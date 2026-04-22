# CONTRIBUTING

## Como Contribuir com a Tessy Antigravity

Obrigado por considerar contribuir. A Tessy tem um fluxo local-first e uma governança bem explícita, então mudanças pequenas e bem testadas costumam ser as que avançam melhor.

> **Leia primeiro:** [`AGENT_PRIMER.md`](AGENT_PRIMER.md)
>
> **Documentação de processo:** `.planning/`, `.claude/get-shit-done/` e os guias em `docs/`

---

## Branch e Commits

- prefira branches com o prefixo `codex/`
- mantenha commits pequenos e atômicos
- não reverta mudanças que você não fez
- se a alteração mexe com comportamento visível, atualize os docs afetados na mesma entrega

Exemplo:

```bash
git checkout -b codex/minha-mudanca
git commit -m "feat: descreve a mudança"
```

---

## O Que Validar Antes de Pedir Review

Use a combinação que faça sentido para a mudança, mas estes são os comandos-base do projeto:

```bash
npm run typecheck
npm run test
npm run e2e -- --grep "smoke|foundation"
```

Se a alteração tocar editor, terminal, roteamento de viewer ou persistência local, valide também os testes da fase correspondente.

---

## O Que Costuma Merecer Atualização de Documento

- novos comportamentos de navegação
- mudanças no shell principal
- alterações no terminal ou no broker
- novos caminhos de arquivo, preferências locais ou chaves de configuração
- mudanças de fluxo que impactem onboarding ou testes

---

## Boas Práticas

- preserve o comportamento local-first
- mantenha o terminal manual por padrão
- trate arquivos remotos como somente leitura
- evite transformar decisões locais em dependência de rede
- documente decisões antes de escondê-las em abstrações novas

---

## Áreas de Interesse

- correções de bugs
- melhorias de experiência no editor/terminal
- refinamentos de roteamento dos viewers
- documentação e exemplos
- testes de regressão e cobertura de fluxo

---

Feito com cuidado pelo Rabelus Lab Council
