# Development

Este guia resume como trabalhar na Tessy sem quebrar a fundação que já está em pé.

---

## Comandos Essenciais

```bash
npm run dev
npm run terminal
npm start
npm run typecheck
npm run test
npm run e2e -- --grep "smoke|foundation"
```

---

## Arquivos Mais Importantes

- `App.tsx` — composição dos providers e bootstrap da aplicação
- `contexts/LayoutContext.tsx` — viewer ativo, arquivo selecionado, autosave e tamanhos
- `hooks/useViewer.ts` — ponte de navegação dos viewers
- `hooks/useViewerRouter.tsx` — montagem dos viewers dentro do painel lateral
- `components/layout/MainLayout.tsx` — layout principal da tela
- `components/layout/CentralCanvas.tsx` — editor, detalhes de projeto e estado vazio
- `components/layout/RealTerminal.tsx` — terminal real via broker
- `components/editor/MonacoWrapper.tsx` — configuração do Monaco
- `services/fileOpenPolicy.ts` — decisão de abertura de arquivo
- `services/terminalPreferences.ts` — scrollback persistido
- `services/monacoEnvironment.ts` — workers locais do Monaco

---

## Fluxo de Mudança

1. altere o comportamento no serviço ou no contexto certo
2. mantenha o layout fino
3. atualize os testes que cobrem o comportamento
4. ajuste a documentação se a mudança aparecer para o usuário

---

## Regras Que Ajudam

- mantenha o terminal manual
- trate arquivos remotos como somente leitura
- use o `fileOpenPolicy` para qualquer novo ponto de abertura de arquivo
- se um toggle ou preferência passa a ser persistido, documente a chave usada
- preserve a sincronização com URL quando mexer em viewers

---

## Padrões de Estado

### `LayoutContext`

Guarda:

- `activeViewer`
- `selectedFile`
- `editorAutoSaveEnabled`
- `terminalHeight`
- `viewerPanelWidth`
- `coPilotWidth`
- `isMobileMenuOpen`

### Persistência

Chaves de `localStorage` relevantes:

- `tessy-editor-autosave`
- `tessy-terminal-scrollback`
- `tessy-terminal-height`
- `tessy-viewer-width`
- `tessy-copilot-width`
- `tessy-theme`
- `tessy-current-project`

---

## Quando Atualizar Esta Pasta

Sempre que mexer em:

- navegação
- editor
- terminal
- workspace local
- integração GitHub
- preferências do usuário

---

## Dica Prática

Depois de uma mudança maior, rode pelo menos:

```bash
npm run typecheck
npm run test
```

Se a interface mudou de forma visível, rode também o filtro de E2E da fundação.
