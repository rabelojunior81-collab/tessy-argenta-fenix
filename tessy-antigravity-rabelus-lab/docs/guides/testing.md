# Testing

Este guia reúne a suíte que mantém a fundação da Tessy segura depois da Fase 1.

---

## Comandos Principais

```bash
npm run typecheck
npm run test
npm run e2e
npm run e2e -- --grep "smoke|foundation"
```

---

## O Que Cada Comando Cobre

- `typecheck` valida os contratos TypeScript
- `test` executa a suíte Vitest completa
- `e2e` sobe o app no browser e roda os fluxos de ponta a ponta
- `e2e -- --grep "smoke|foundation"` foca nos fluxos essenciais da base

---

## Testes Da Fase 1

Os testes adicionados para a fundação cobrem:

- sincronização de viewer com a History API
- política de arquivos grandes
- bootstrap do Monaco com workers locais
- preferências persistidas do terminal
- estados do terminal real
- header do editor com autosave e save manual
- fluxo E2E de shell e viewer

Arquivos:

- `src/test/foundation/viewerRouting.test.tsx`
- `src/test/foundation/fileOpenPolicy.test.ts`
- `src/test/foundation/monacoSetup.test.ts`
- `src/test/foundation/terminalPreferences.test.ts`
- `src/test/foundation/realTerminal.test.tsx`
- `src/test/foundation/editorHeader.test.tsx`
- `e2e/foundation.spec.ts`

---

## Setup De Teste

- `src/test/setup.ts` faz cleanup automático do Testing Library
- o ambiente de teste usa `jsdom`
- `localStorage` é shimado com armazenamento em memória para manter os testes estáveis
- o Playwright config sobe o Vite dev server automaticamente

---

## O Que Costuma Quebrar

- texto de botão e título quando o header do editor muda
- contratos de `readOnly` no Monaco
- comportamento do terminal quando o broker está indisponível
- novos viewers sem sincronização com URL
- persistência local quando a chave muda

---

## Regra Boa

Se a mudança tocar experiência de usuário, prefira um teste pequeno e direto que prove o comportamento principal ao invés de um teste muito acoplado ao markup.
