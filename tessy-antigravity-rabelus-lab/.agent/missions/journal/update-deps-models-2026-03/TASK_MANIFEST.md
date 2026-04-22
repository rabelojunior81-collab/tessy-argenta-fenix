# TASK MANIFEST
## Missão: `update-deps-models-2026-03`
**Data:** 2026-03-07 | **Status geral:** `PENDENTE`

---

## ESTRUTURA DE GRUPOS

```
GRUPO A — Modelos de Inferência Gemini        [ALTA PRIORIDADE]
GRUPO B — SDK @google/genai                   [ALTA PRIORIDADE]
GRUPO C — Divergência xterm                   [MÉDIA PRIORIDADE]
GRUPO D — Saneamento package.json             [MÉDIA PRIORIDADE]
GRUPO E — Higiene de tipos (ViewerType)       [BAIXA PRIORIDADE]
GRUPO F — CryptoService → AuthProviders       [MÉDIA PRIORIDADE, COMPLEXO]
GRUPO Z — Documentação e fechamento           [OBRIGATÓRIO, ÚLTIMO]
```

**Ordem de execução obrigatória:** A → B → C → D → E → F → Z

Os grupos A e B têm dependência lógica entre si (B pode introduzir breaking changes que afetam A). Execute A primeiro para ter baseline, depois B para atualizar SDK, depois valide A novamente se o SDK tiver mudado a interface.

---

## GRUPO A — Modelos de Inferência Gemini
**Branch:** `feature/update-gemini-models`

---

### TASK-A1 — Verificar model IDs ativos no SDK
**Status:** `PENDENTE`
**Risco:** ALTO — Se os IDs estiverem errados, toda inferência falha silenciosamente ou com erro 404.
**Tipo:** Pesquisa + Verificação

**O que fazer:**
1. Inspecionar o pacote instalado localmente para descobrir quais model IDs são válidos:
   ```bash
   # Verificar se há lista de modelos no SDK
   cat node_modules/@google/genai/README.md 2>/dev/null | head -100
   grep -r "gemini-" node_modules/@google/genai/dist/ --include="*.js" -l 2>/dev/null | head -5
   ```
2. Consultar o changelog do SDK para identificar modelos documentados:
   ```bash
   cat node_modules/@google/genai/CHANGELOG.md 2>/dev/null | head -200
   ```
3. Identificar os model IDs candidatos para substituir os atuais:
   - `gemini-3-flash-preview` → substituto a determinar
   - `gemini-3-pro-preview` → substituto a determinar
   - `gemini-flash-lite-latest` → substituto a determinar

**Arquivo de referência:** `services/gemini/client.ts` (linhas 5-7)

**Critério de aceitação:**
- Lista de model IDs verificados documentada no REPORT
- Pelo menos um ID confirmado para cada papel (Flash, Pro, Lite)
- Decisão justificada no REPORT

**Commit:** Nenhum (tarefa de pesquisa). Anotar resultado no REPORT antes de avançar para A2.

---

### TASK-A2 — Atualizar MODEL_FLASH, MODEL_PRO, MODEL_LITE
**Status:** `PENDENTE`
**Depende de:** TASK-A1 (resultado da verificação)
**Risco:** ALTO

**Arquivo a modificar:** `services/gemini/client.ts`

**Estado atual:**
```typescript
export const MODEL_FLASH = 'gemini-3-flash-preview'
export const MODEL_PRO   = 'gemini-3-pro-preview'
export const MODEL_LITE  = 'gemini-flash-lite-latest'
```

**O que fazer:**
1. Substituir os três valores pelos IDs verificados em TASK-A1
2. Adicionar comentário inline com a data de verificação:
   ```typescript
   // Verificado em 2026-03-XX. Rever se inferência retornar 404.
   export const MODEL_FLASH = '[ID_VERIFICADO]'
   export const MODEL_PRO   = '[ID_VERIFICADO]'
   export const MODEL_LITE  = '[ID_VERIFICADO]'
   ```

**Critério de aceitação:**
- Os três constantes atualizam com IDs verificados
- Comentário de data presente
- Nenhuma outra mudança no arquivo

**Commit:**
```bash
git commit -am "TSP: [A2] Atualiza model IDs para versoes verificadas em 2026-03"
```

---

### TASK-A3 — Sincronizar dropdown de modelos no ChatContext
**Status:** `PENDENTE`
**Depende de:** TASK-A2
**Risco:** MÉDIO

**Arquivo a modificar:** `contexts/ChatContext.tsx`

**Estado atual (INITIAL_FACTORS, fator 'model'):**
```typescript
{
  id: 'model',
  type: 'dropdown',
  label: 'Modelo de Linguagem',
  enabled: true,
  value: 'gemini-3-flash-preview',     // ← default
  options: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-flash-lite-latest']
}
```

**O que fazer:**
1. Atualizar `value` (default) para o novo MODEL_FLASH
2. Atualizar o array `options` com os três novos IDs

**IMPORTANTE:** Não importar as constantes de `client.ts` diretamente aqui (risco de dependência circular). Copiar os valores como strings.

**Critério de aceitação:**
- `value` default = novo MODEL_FLASH
- `options` contém exatamente os três novos IDs, na mesma ordem (Flash, Pro, Lite)
- `npx tsc --noEmit` passa

**Commit:**
```bash
git commit -am "TSP: [A3] Sincroniza dropdown de modelos com novos IDs"
```

---

### TASK-A4 — Validar TypeScript e merge do Grupo A
**Status:** `PENDENTE`
**Depende de:** TASK-A2, TASK-A3

**O que fazer:**
```bash
npx tsc --noEmit
```

Se passar:
```bash
git checkout main
git merge feature/update-gemini-models --no-ff -m "TSP: Merge update-gemini-models — IDs atualizados e dropdown sincronizado"
git branch -d feature/update-gemini-models
```

Se falhar: registrar erro no REPORT, corrigir, recompilar antes de merge.

**Critério de aceitação:** Zero erros TypeScript. Branch mergeada e deletada.

---

## GRUPO B — SDK @google/genai
**Branch:** `feature/update-genai-sdk`

---

### TASK-B1 — Verificar versão atual e changelog do SDK
**Status:** `PENDENTE`
**Risco:** ALTO — Upgrades de SDK podem ter breaking changes na interface de `generateContent`.

**O que fazer:**
1. Verificar versão instalada e última disponível:
   ```bash
   npm show @google/genai version
   npm show @google/genai versions --json | tail -20
   ```
2. Comparar com versão em `package.json` (`^1.34.0`)
3. Ler CHANGELOG do SDK para identificar breaking changes entre `1.34.0` e a versão mais recente:
   ```bash
   cat node_modules/@google/genai/CHANGELOG.md 2>/dev/null
   ```
4. Verificar se a interface `generateContent`, `functionCalls`, e `candidates` permanece compatível

**Critério de aceitação:**
- Versão alvo identificada no REPORT
- Breaking changes documentados (ou "nenhum" se não houver)
- Decisão de upgrade ou manter documentada e justificada

**Commit:** Nenhum (pesquisa). Avançar para B2 apenas se a decisão for atualizar.

---

### TASK-B2 — Atualizar @google/genai no package.json
**Status:** `PENDENTE`
**Depende de:** TASK-B1 (decisão de upgrade)
**Condição:** Executar APENAS se TASK-B1 identificar versão mais recente sem breaking changes incompatíveis.

**O que fazer:**
```bash
npm install @google/genai@latest
```

OU fixar em versão específica se `latest` tiver breaking changes:
```bash
npm install @google/genai@[versão-alvo]
```

**Critério de aceitação:**
- `package.json` e `package-lock.json` atualizados
- `npm install` sem erros
- `npx tsc --noEmit` passa

**Commit:**
```bash
git commit -am "TSP: [B2] Atualiza @google/genai para v[versao]"
```

---

### TASK-B3 — Adaptar código se houver breaking changes
**Status:** `PENDENTE` (condicional)
**Depende de:** TASK-B2
**Condição:** Executar APENAS se TASK-B1 identificar breaking changes que afetem os arquivos existentes.

**Arquivos que usam o SDK diretamente:**
- `services/gemini/service.ts` — usa `generateContent`, `functionCalls`, `candidates`
- `services/gemini/client.ts` — usa `GoogleGenAI`

**O que fazer:**
1. Aplicar apenas as mudanças mínimas para compatibilidade com a nova versão
2. Não refatorar código que não seja necessário para a compatibilidade
3. Documentar cada adaptação no REPORT com "linha X alterada porque [motivo de breaking change]"

**Critério de aceitação:**
- `npx tsc --noEmit` passa
- `npm run start` inicia sem erro

**Commit:**
```bash
git commit -am "TSP: [B3] Adapta service.ts/client.ts para @google/genai v[versao]"
```

---

### TASK-B4 — Validar e merge do Grupo B
**Status:** `PENDENTE`
**Depende de:** B2 (e B3 se aplicável)

```bash
npx tsc --noEmit
git checkout main
git merge feature/update-genai-sdk --no-ff -m "TSP: Merge update-genai-sdk — SDK atualizado para v[versao]"
git branch -d feature/update-genai-sdk
```

---

## GRUPO C — Divergência xterm
**Branch:** `feature/fix-xterm-importmap`

---

### TASK-C1 — Diagnosticar divergência xterm
**Status:** `PENDENTE`
**Risco:** BAIXO

**Divergência atual:**
- `package.json`: `"@xterm/xterm": "^6.0.0"`
- `index.html` importmap: `"xterm": "https://esm.sh/xterm@^5.3.0"`

**O que fazer:**
1. Verificar qual versão está em uso real:
   - `RealTerminal.tsx` importa de `@xterm/xterm` (pacote npm, não importmap)
   - O importmap `xterm` legado pode não estar sendo usado
   ```bash
   grep -r "from 'xterm'" src/ components/ 2>/dev/null
   grep -r "from '@xterm" src/ components/ 2>/dev/null
   ```
2. Verificar se algum componente usa o path `xterm` (sem `@`) do importmap

**Critério de aceitação:** Diagnóstico documentado no REPORT antes de qualquer alteração.

---

### TASK-C2 — Corrigir divergência xterm no importmap
**Status:** `PENDENTE`
**Depende de:** TASK-C1

**Arquivo a modificar:** `index.html`

**Cenário A — importmap `xterm` não está em uso:**
- Remover a entrada `"xterm"` do importmap (ou atualizar para `@xterm/xterm@6.0.0`)
- Manter as entradas `@xterm/addon-fit` e `@xterm/addon-attach` se presentes

**Cenário B — algum código usa `xterm` via importmap:**
- Atualizar a URL para `https://esm.sh/@xterm/xterm@6.0.0`
- Atualizar também as entradas dos addons para versões compatíveis com xterm 6

**Critério de aceitação:**
- `index.html` e `package.json` referenciam o mesmo range de versão do xterm
- `npm run start` inicia sem erro de módulo
- Terminal conecta normalmente (teste manual se possível)

**Commit:**
```bash
git commit -am "TSP: [C2] Alinha versao xterm entre importmap e package.json"
```

---

### TASK-C3 — Validar e merge do Grupo C
```bash
npx tsc --noEmit
git checkout main
git merge feature/fix-xterm-importmap --no-ff -m "TSP: Merge fix-xterm-importmap — xterm alinhado v6.0.0"
git branch -d feature/fix-xterm-importmap
```

---

## GRUPO D — Saneamento do package.json
**Branch:** `feature/sanitize-package-json`

---

### TASK-D1 — Verificar uso real de puppeteer, axios, cheerio, turndown
**Status:** `PENDENTE`
**Risco:** BAIXO

**O que fazer:**
```bash
grep -r "puppeteer" src/ services/ components/ contexts/ hooks/ server/ --include="*.ts" --include="*.tsx" -l 2>/dev/null
grep -r "axios" src/ services/ components/ contexts/ hooks/ server/ --include="*.ts" --include="*.tsx" -l 2>/dev/null
grep -r "cheerio" src/ services/ components/ contexts/ hooks/ server/ --include="*.ts" --include="*.tsx" -l 2>/dev/null
grep -r "turndown" src/ services/ components/ contexts/ hooks/ server/ --include="*.ts" --include="*.tsx" -l 2>/dev/null
```

Documentar resultados no REPORT antes de qualquer mudança.

**Critério de aceitação:** Mapa de uso documentado no REPORT.

---

### TASK-D2 — Reposicionar dependências no package.json
**Status:** `PENDENTE`
**Depende de:** TASK-D1

**Arquivo a modificar:** `package.json`

**Ações esperadas (confirmar com D1):**
- `puppeteer` → mover para `devDependencies` (se não usado no código frontend/servidor de produção)
- `puppeteer-core` → mover para `devDependencies` (mesmo critério)
- `axios` → mover para `devDependencies` se não há uso, ou remover se não há uso real
- `cheerio` → idem
- `turndown` → idem

**Critério de aceitação:**
- `npm install` sem erros após mudança
- Nenhum import que dependia dessas libs quebrou
- `npx tsc --noEmit` passa

**Commit:**
```bash
git commit -am "TSP: [D2] Reposiciona puppeteer/axios/cheerio/turndown no package.json"
```

---

### TASK-D3 — Validar e merge do Grupo D
```bash
npm install
npx tsc --noEmit
git checkout main
git merge feature/sanitize-package-json --no-ff -m "TSP: Merge sanitize-package-json — dependencias reposicionadas"
git branch -d feature/sanitize-package-json
```

---

## GRUPO E — Higiene de tipos (ViewerType)
**Branch:** `feature/remove-controllers-viewer-type`

---

### TASK-E1 — Investigar origem do tipo 'controllers'
**Status:** `PENDENTE`
**Risco:** MÍNIMO

**O que fazer:**
```bash
grep -r "controllers" src/ services/ components/ contexts/ hooks/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Verificar se:
1. Existe algum componente `ControllersViewer` em qualquer lugar
2. Existe algum `abrirViewer('controllers')` sendo chamado
3. O `ControllersModal` é diferente de um "viewer controllers" (são coisas distintas — o modal já existe e funciona via CoPilot toolbar)

**Critério de aceitação:** Diagnóstico documentado. Decisão: remover o tipo OU implementar o viewer.

---

### TASK-E2 — Remover 'controllers' de ViewerType
**Status:** `PENDENTE`
**Depende de:** TASK-E1
**Condição:** Executar se E1 confirmar que não há uso do tipo 'controllers' como viewer.

**Arquivo a modificar:** `contexts/LayoutContext.tsx`

**Estado atual (linha 5):**
```typescript
export type ViewerType = 'history' | 'library' | 'projects' | 'controllers' | 'github' | 'files' | null;
```

**Estado alvo:**
```typescript
export type ViewerType = 'history' | 'library' | 'projects' | 'github' | 'files' | null;
```

**Critério de aceitação:**
- `'controllers'` removido do tipo
- `npx tsc --noEmit` passa (TypeScript confirmará que nenhum código usa este valor)

**Commit:**
```bash
git commit -am "TSP: [E2] Remove tipo orphao 'controllers' de ViewerType"
```

---

### TASK-E3 — Validar e merge do Grupo E
```bash
npx tsc --noEmit
git checkout main
git merge feature/remove-controllers-viewer-type --no-ff -m "TSP: Merge remove-controllers-viewer-type — tipo orfao removido"
git branch -d feature/remove-controllers-viewer-type
```

---

## GRUPO F — CryptoService → AuthProviders
**Branch:** `feature/connect-crypto-tokens`

> ⚠️ **GRUPO DE MAIOR COMPLEXIDADE.** Leia toda a especificação antes de começar qualquer implementação.

---

### TASK-F0 — Decisão de design antes de implementar
**Status:** `PENDENTE`
**Risco:** ALTO — Mudança no sistema de armazenamento de tokens pode bloquear usuários existentes se a migração não for tratada.

**Contexto:**
- Tokens estão hoje em texto plano em `tessy_auth` (IndexedDB, banco `idb`)
- `cryptoService.ts` usa AES-GCM com chave derivada de senha mestra
- Se criptografar, usuários precisarão fornecer senha mestra ao inicializar
- Se não houver migração, tokens existentes serão ilegíveis após a mudança

**Decisão necessária ANTES de implementar:**

**Opção 1 — Criptografia transparente (sem senha mestra):**
- Usar uma chave derivada de um valor fixo (ex: fingerprint do browser, UUID gerado e salvo no banco)
- Proteção fraca (qualquer script na mesma origin pode reconstituir a chave), mas melhor que texto plano
- Não requer interação do usuário
- Migração automática na primeira leitura

**Opção 2 — Criptografia com senha mestra:**
- Requer novo modal de senha mestra no boot da aplicação
- Muito mais seguro
- Requer UI nova e lógica de inicialização (fora do escopo desta missão)
- **RECOMENDAÇÃO: adiar para missão específica de segurança**

**Opção 3 — Manter como está, documentar o risco:**
- Sem mudança de código
- Registrar no REPORT que criptografia ficou pendente para missão de segurança dedicada

**O executor deve documentar a decisão no REPORT antes de qualquer código.**

Se a decisão for Opção 1, continuar com F1-F4.
Se for Opção 2 ou 3, a tarefa do Grupo F é apenas documentar e pular para Grupo Z.

---

### TASK-F1 — Implementar chave derivada sem senha (Opção 1)
**Status:** `PENDENTE` (condicional — só se F0 decidir Opção 1)
**Depende de:** TASK-F0

**Arquivo a modificar:** `services/cryptoService.ts`

**O que adicionar:**
```typescript
// Gera ou recupera um device key único, derivado de UUID salvo no banco
export async function getOrCreateDeviceKey(): Promise<void> {
  // 1. Buscar UUID salvo no settings
  // 2. Se não existir, gerar crypto.randomUUID() e salvar
  // 3. Usar o UUID como "masterPassword" para initializeSecurity()
}
```

**Critério de aceitação:**
- Função implementada
- `isSecurityInitialized()` retorna `true` após chamar `getOrCreateDeviceKey()`
- `npx tsc --noEmit` passa

**Commit:**
```bash
git commit -am "TSP: [F1] Adiciona getOrCreateDeviceKey ao cryptoService"
```

---

### TASK-F2 — Inicializar crypto no boot da aplicação
**Status:** `PENDENTE` (condicional)
**Depende de:** TASK-F1

**Arquivo a modificar:** `App.tsx`

No `useEffect` de boot (função `boot`, linha ~71):
```typescript
// Após migrateToIndexedDB():
await getOrCreateDeviceKey(); // inicializa crypto antes de qualquer acesso a tokens
```

**Critério de aceitação:**
- `initializeSecurity` chamado antes de qualquer `getToken()`
- `npx tsc --noEmit` passa

**Commit:**
```bash
git commit -am "TSP: [F2] Inicializa crypto no boot antes de leitura de tokens"
```

---

### TASK-F3 — Conectar encriptação ao setToken e getToken
**Status:** `PENDENTE` (condicional)
**Depende de:** TASK-F1, TASK-F2

**Arquivo a modificar:** `services/authProviders.ts`

**Estado atual:**
```typescript
export async function getToken(providerId): Promise<string | null> {
  const db = await getDB();
  return await db.get(STORE_NAME, providerId) || null;
}

export async function setToken(providerId, token): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, token, providerId);
}
```

**Estado alvo:**
```typescript
import { encryptData, decryptData, isSecurityInitialized } from './cryptoService';

export async function getToken(providerId): Promise<string | null> {
  const db = await getDB();
  const stored = await db.get(STORE_NAME, providerId) || null;
  if (!stored) return null;

  // Detecta se é dado encriptado (objeto) ou texto plano legado (string)
  if (typeof stored === 'string') {
    // Migração: texto plano legado → re-salva encriptado
    if (isSecurityInitialized()) {
      const encrypted = await encryptData(stored);
      await db.put(STORE_NAME, encrypted, providerId);
      return stored;
    }
    return stored;
  }

  // Dado encriptado normal
  if (!isSecurityInitialized()) return null;
  return await decryptData(stored);
}

export async function setToken(providerId, token): Promise<void> {
  if (!isSecurityInitialized()) {
    throw new Error('Security not initialized. Call getOrCreateDeviceKey() first.');
  }
  const db = await getDB();
  const encrypted = await encryptData(token);
  await db.put(STORE_NAME, encrypted, providerId);
}
```

**Critério de aceitação:**
- `getToken` lida com tokens legados (string plana) e migra automaticamente
- `setToken` sempre salva encriptado se crypto inicializado
- `npx tsc --noEmit` passa
- Testar manualmente: salvar um token, recarregar, verificar que lê corretamente

**Commit:**
```bash
git commit -am "TSP: [F3] Conecta encriptacao AES-GCM ao setToken/getToken"
```

---

### TASK-F4 — Validar e merge do Grupo F
```bash
npx tsc --noEmit
git checkout main
git merge feature/connect-crypto-tokens --no-ff -m "TSP: Merge connect-crypto-tokens — tokens cifrados com AES-GCM device-key"
git branch -d feature/connect-crypto-tokens
```

---

## GRUPO Z — Documentação e fechamento
**Branch:** Sem branch separada — executar direto em main após todos os merges.

---

### TASK-Z1 — Atualizar CHANGELOG.md
**Status:** `PENDENTE`
**Depende de:** Todos os grupos anteriores concluídos

**Arquivo a modificar:** `CHANGELOG.md`

Adicionar entrada no topo com todas as mudanças desta missão:
```markdown
## [v4.6.2] - 2026-03-XX
### Manutenção e Atualização de Infraestrutura
- [A] Modelos Gemini atualizados: [listar mudanças]
- [B] @google/genai SDK atualizado para v[versao]
- [C] xterm alinhado entre importmap e package.json (v6.0.0)
- [D] package.json saneado: puppeteer/axios/cheerio/turndown reposicionados
- [E] Tipo órfão 'controllers' removido de ViewerType
- [F] CryptoService conectado ao authProviders ([descrever decisão])
```

**Commit:**
```bash
git commit -am "TSP: [Z1] Atualiza CHANGELOG com todas as mudancas da missao"
```

---

### TASK-Z2 — Atualizar auditoria com status resolvido
**Status:** `PENDENTE`

**Arquivo a modificar:** `docs/auditoria-holistica-tessy-v4.6.1_2026-03-07.md`

Na Seção 15 (Recomendações), adicionar coluna de status para cada item tratado:
- `✅ RESOLVIDO em [data] — [commit hash]`
- `⏳ ADIADO — [motivo]`
- `❌ NÃO APLICÁVEL — [motivo]`

**Commit:**
```bash
git commit -am "TSP: [Z2] Atualiza doc de auditoria com status das resolucoes"
```

---

### TASK-Z3 — Preencher e salvar MISSION_REPORT.md
**Status:** `PENDENTE`

Preencher o template em `REPORT_TEMPLATE.md` e salvar como:
```
.agent/missions/update-deps-models-2026-03/MISSION_REPORT.md
```

**Commit:**
```bash
git commit -am "TSP: [Z3] Entrega MISSION_REPORT.md — missao concluida"
```

---

### TASK-Z4 — Auditoria holística pós-missão
**Status:** `PENDENTE`

```bash
# Buscar referências órfãs relacionadas às mudanças
grep -r "gemini-3-flash-preview\|gemini-3-pro-preview\|gemini-flash-lite-latest" \
  --include="*.ts" --include="*.tsx" --include="*.html" .
grep -r "'controllers'" --include="*.ts" --include="*.tsx" . 2>/dev/null
```

Se encontrar referências órfãs não tratadas, criar um commit de correção antes de fechar.

---

## TABELA RESUMO

| Task | Grupo | Prioridade | Risco | Depende de | Condicional |
|---|---|---|---|---|---|
| A1 | Modelos | ALTA | ALTO | — | Não |
| A2 | Modelos | ALTA | ALTO | A1 | Não |
| A3 | Modelos | ALTA | MÉDIO | A2 | Não |
| A4 | Modelos | ALTA | BAIXO | A2,A3 | Não |
| B1 | SDK | ALTA | ALTO | — | Não |
| B2 | SDK | ALTA | ALTO | B1 | Sim (se upgrade) |
| B3 | SDK | ALTA | MÉDIO | B2 | Sim (se breaking changes) |
| B4 | SDK | ALTA | BAIXO | B2,B3 | Não |
| C1 | xterm | MÉDIA | BAIXO | — | Não |
| C2 | xterm | MÉDIA | BAIXO | C1 | Não |
| C3 | xterm | MÉDIA | BAIXO | C2 | Não |
| D1 | pkg.json | MÉDIA | BAIXO | — | Não |
| D2 | pkg.json | MÉDIA | BAIXO | D1 | Não |
| D3 | pkg.json | MÉDIA | BAIXO | D2 | Não |
| E1 | Tipos | BAIXA | MÍNIMO | — | Não |
| E2 | Tipos | BAIXA | MÍNIMO | E1 | Não |
| E3 | Tipos | BAIXA | MÍNIMO | E2 | Não |
| F0 | Crypto | MÉDIA | ALTO | — | Não |
| F1 | Crypto | MÉDIA | ALTO | F0 | Sim (Opção 1) |
| F2 | Crypto | MÉDIA | ALTO | F1 | Sim (Opção 1) |
| F3 | Crypto | MÉDIA | ALTO | F1,F2 | Sim (Opção 1) |
| F4 | Crypto | MÉDIA | ALTO | F1,F2,F3 | Sim (Opção 1) |
| Z1 | Docs | OBRIG. | BAIXO | Todos grupos | Não |
| Z2 | Docs | OBRIG. | BAIXO | Todos grupos | Não |
| Z3 | Docs | OBRIG. | BAIXO | Todos grupos | Não |
| Z4 | Docs | OBRIG. | BAIXO | Todos grupos | Não |
