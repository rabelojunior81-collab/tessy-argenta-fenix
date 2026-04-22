# MISSION BRIEFING
## Missao: `cryptoservice-integration-2026-03`
**Data:** 2026-03-07
**Criado por:** Claude Sonnet 4.6 — Auditor/Executor
**Status:** `EM_EXECUCAO`
**Repositorio:** `e:\conecta\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Identificado na auditoria holistica v4.6.1: `services/cryptoService.ts` esta totalmente
implementado (AES-GCM 256 + PBKDF2, 100000 iteracoes) mas nunca chamado.
Os tokens (Gemini, GitHub, OpenAI, Z.ai) ficam em plaintext no IndexedDB `tessy_auth`.

## 2. ARQUITETURA DA SOLUCAO

**Device Key Pattern** — integracao transparente sem UX friction:

1. Na primeira operacao de token, gerar uma chave aleatoria (32 bytes hex) e salvar
   em `localStorage` com ID `tessy_dk`.
2. Usar essa chave como `masterPassword` do `initializeSecurity()`.
3. `setToken()` → criptografar com `encryptData()` → armazenar objeto `{ciphertext, iv}`.
4. `getToken()` → detectar se valor armazenado e `EncryptedData` → descriptografar.
   Se for string plaintext (legacy) → retornar diretamente (backward compat).

**Resultado:**
- Tokens existentes continuam funcionando (lidos como plaintext)
- Novos tokens salvos sao criptografados
- Transparente para o usuario — sem prompt de senha
- Clearing localStorage invalida os tokens no DB (aceitavel para tool de lab)

## 3. ARQUIVOS A MODIFICAR

| Arquivo | Mudanca |
|---|---|
| `services/authProviders.ts` | Importar crypto, adicionar `ensureCryptoInitialized()`, modificar `getToken`/`setToken` |
| `components/modals/AuthPanel.tsx` | Adicionar indicador de status de criptografia no footer |

## 4. ARQUIVOS QUE NAO DEVEM SER MODIFICADOS

- `services/cryptoService.ts` — ja completo
- `services/dbService.ts` — nao tocar schema

## 5. CRITERIO DE SUCESSO

- [ ] `setToken()` armazena objeto `{ciphertext, iv}` no IndexedDB
- [ ] `getToken()` retorna plaintext apos descriptografar
- [ ] Tokens antigos (string plaintext) continuam funcionando sem erros
- [ ] AuthPanel exibe indicador de criptografia ativa
- [ ] `npx tsc --noEmit` sem erros
- [ ] CHANGELOG atualizado
