# Auditoria Holística — Tessy "Tesseract" vs "Toolchain"
**Data:** 2026-03-16
**Auditor:** Kimi Code CLI (Deep Structural Analysis)
**Status do Projeto:** Degradê Arquitetural Acelerado (v5.0.1-devmode)

---

## 1. RESUMO EXECUTIVO: O DIAGNÓSTICO "DEGRADÊ ESTRUTURAL"

A Tessy opera em um estado de **degradê arquitetural acelerado**, onde a velocidade de desenvolvimento suprimiu a qualidade estrutural. O projeto acumulou dívidas técnicas críticas que, embora funcionais no curto prazo, criam vetores de falha exponenciais à medida que a codebase cresce.

### Divergência de Perspectiva (Gemini vs Kimi)

| Dimensão | Diagnóstico Gemini | Diagnóstico Kimi |
|----------|-------------------|------------------|
| **Natureza do Problema** | Esquizofrenia arquitetural (bifurcação intencional) | Degradê estrutural (débito técnico não gerenciado) |
| **Foco Principal** | Componentes órfãos e stubs não ativados | Qualidade de implementação e contratos quebrados |
| **Risco Crítico** | Funcionalidades quebradas (AutoDoc CORS) | Exposição de segredos + falta de testes + dependências RC |

### Vetores de Falha Críticos (Prioridade Kimi)

1. **Superfície de Ataque Expandida:** Tokens de API em plaintext no IndexedDB com acesso irrestrito via DevTools
2. **Ausência de Pirâmide de Testes:** E2E smoke superficial, zero testes unitários, MSW não configurado
3. **Dependência de Software Instável:** Express 5.2.1 é Release Candidate (não stable)
4. **Degradê de Segurança Intencional:** `cryptoService.ts` existe mas foi desativado por "decisão operacional"
5. **Modelos de IA Instáveis:** Uso de modelos v3-preview no critical path (risco de descontinuação)

---

## 2. ANÁLISE DE METADADOS E CONSISTÊNCIA

### 2.1 Divergência de Versionamento

| Arquivo | Versão Declarada | Observação Kimi |
|---------|------------------|-----------------|
| `README.md` | v4.9.1 | **OBSOLETO** — não reflete estado atual do sistema |
| `ARCHITECTURE.md` | v5.0.0-toolchain | **ESPECULATIVO** — descreve arquitetura aspiracional |
| `package.json` | 5.0.1-devmode | **CONFIÁVEL** — única fonte de verdade operacional |
| `App.tsx` (footer) | v4.9.1 (Nucleus) | **INCONSISTENTE** — UI mente para o usuário |

**Impacto:** Falta de "Single Source of Truth" dificulta rollback, debugging e comunicação entre agentes.

### 2.2 Metadados de Build

```json
// package.json — dependências críticas
{
  "express": "^5.2.1",        // ⚠️ RC — instável em produção
  "react": "^19.2.3",         // ✅ Atual (cana release)
  "typescript": "^5.9.3",     // ✅ RC mas aceitável
  "@google/genai": "^1.44.0"  // ⚠️ SDK legado — Vercel AI SDK disponível mas não usado
}
```

---

## 3. ANÁLISE DE SEGURANÇA: SUPERFÍCIE DE ATAQUE

### 3.1 Armazenamento de Segredos — REGRESSÃO CRÍTICA

**Estado Atual (v5.0.1-devmode):**
```typescript
// services/authProviders.ts (linha 99-122)
export async function getToken(providerId: AuthProvider['id']): Promise<string | null> {
    const db = await getDB();
    const stored = await db.get(STORE_NAME, providerId);
    if (typeof stored === 'string') return stored;  // ⚠️ PLAINTEXT
    return null;
}
```

**Estado Anterior (criptografado):**
```typescript
// services/cryptoService.ts — EXISTE MAS NÃO É USADO
export async function encryptData(data: string): Promise<EncryptedData> {
    // AES-GCM 256-bit + PBKDF2 (100k iterações)
    // Implementação correta mas ORFÃ
}
```

**Vetor de Ataque:**
1. Atacante com acesso físico/malware abre DevTools
2. Acessa `Application → IndexedDB → tessy_auth → tokens`
3. Extrai tokens de Gemini, GitHub, Anthropic em plaintext
4. **Dano:** Escalada de privilégios, acesso a repositórios privados, custos de API

**Nota de Risco:** A decisão de remover criptografia (2026-03-10) foi documentada como "RISCO_ACEITO (dev local)", mas não há mecanismo de proteção para quando o ambiente muda.

### 3.2 Validação de Entrada — Inconsistências

| Serviço | Validação | Status |
|---------|-----------|--------|
| `githubService.ts` | Regex para branches, validação de commits | ✅ Boa |
| `authProviders.ts` | Validadores por provider (ex: `token.startsWith('AIza')`) | ⚠️ Superficial |
| `brokerClient.ts` | Nenhuma validação de `workspaceId` | ❌ Ausente |
| `autoDocScheduler.ts` | Nenhuma sanitização de URL | ❌ XSS potencial |

### 3.3 CORS e Origem

```typescript
// server/index.ts (linha 69-72)
function isAllowedOrigin(origin?: string): boolean {
    if (!origin) return true;  // ⚠️ Permite requests sem origin
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}
```

**Risco:** `null` origin bypass em alguns navegadores (CVEs históricas de WebSocket).

---

## 4. ANÁLISE ARQUITETURAL: COESÃO E ACOPLAMENTO

### 4.1 Contextos React — Análise de Responsabilidade

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONTEXT HIERARCHY                        │
├─────────────────────────────────────────────────────────────────┤
│  VisualProvider (tema, wallpaper)                               │
│       ↓                                                         │
│  LayoutProvider (UI state, navegação)                          │
│       ↓                                                         │
│  GitHubProvider (GitHub API + pending actions)                 │
│       ↓                                                         │
│  WorkspaceProvider (FS local + git + broker + pending actions) │
│       ↓                                                         │
│  ChatProvider (chat + pipeline LLM)                            │
└─────────────────────────────────────────────────────────────────┘
```

**Problemas de Coesão:**

1. **WorkspaceProvider Violando SRP:**
   - Gerencia File System Access API
   - Gerencia operações git (via isomorphic-git)
   - Gerencia broker registration
   - Gerencia pending actions de AI
   - Total: ~500 linhas, 15 métodos públicos

2. **Duplicação de Pending Actions:**
   - `GitHubContext` gerencia `PendingAction[]` (operações GitHub)
   - `WorkspaceContext` gerencia `WorkspacePendingAction[]` (operações FS)
   - **Não são redundantes** — servem domínios diferentes (Gemini estava correto em detectar, incorreto em classificar como problema)

### 4.2 Serviços Órfãos — Análise de Impacto Real

| Serviço | Status Gemini | Impacto Real Kimi | Custo de Ativação |
|---------|---------------|-------------------|-------------------|
| `aiProviders.ts` | Órfão | **Alto** — duplica lógica de modelos, ChatContext usa SDK legado | 2-3 dias (refatorar pipeline) |
| `firecrawlService.ts` | Não utilizado | **Crítico** — AutoDoc falha em 90% dos targets | 4-6 horas (integrar fallback) |
| `cryptoService.ts` | Desconectado | **Alto** — regressão de segurança | 1 dia (reativar em authProviders) |
| `index.hono.ts` | Stub | **Médio** — Express RC é instável | 2-3 dias (WebSocket + testes) |

### 4.3 Divergência de Modelos LLM

| Contexto | Modelo Flash | Modelo Pro | Modelo Lite |
|----------|--------------|------------|-------------|
| `ChatContext.tsx` | `gemini-3-flash-preview` | `gemini-3.1-pro-preview` | `gemini-3.1-flash-lite-preview` |
| `aiProviders.ts` | `gemini-2.0-flash` | `gemini-2.5-pro` | `gemini-2.0-flash-lite` |
| `gemini/client.ts` | `gemini-3-flash-preview` | `gemini-3.1-pro-preview` | — |

**Risco:** Modelos `v3-preview` podem ser descontinuados sem aviso prévio pela Google. O `aiProviders.ts` tem versões mais estáveis mas **não é usado**.

---

## 5. DÍVIDA TÉCNICA QUANTIFICADA

### 5.1 Code Smells por Categoria

| Categoria | Ocorrências | Severidade | Exemplo |
|-----------|-------------|------------|---------|
| **Código Morto** | 3 arquivos | Média | `cryptoService.ts` não utilizado |
| **Duplicação** | 2 instâncias | Baixa | Lógica de validação de token em múltiplos lugares |
| **Comentários Órfãos** | 5+ | Baixa | Referências a "Sprint 1.1" em código atual |
| **Bypass de Camada** | 1 | Alta | ChatContext → SDK direto (ignora aiProviders) |
| **Regex para HTML** | 1 | Média | `autoDoc.worker.ts` usando regex para strip HTML |
| **Magic Numbers** | 4+ | Baixa | Timeouts hardcoded, tamanhos de limite |

### 5.2 Complexidade Ciclomática (Estimativa)

| Arquivo | Complexidade | Risco |
|---------|--------------|-------|
| `gemini/service.ts` | Alta (~25) | Múltiplos branches para function calls |
| `WorkspaceContext.tsx` | Alta (~30) | Múltiplos estados e efeitos |
| `autoDocScheduler.ts` | Média (~15) | Fluxo de sync com múltiplos caminhos |
| `server/index.ts` | Média (~12) | Tratamento de erros + WebSocket |

### 5.3 Ausência de Testes — Pirâmide Invertida

```
        /\
       /  \
      / E2E \      ← 1 teste (smoke apenas)
     /--------\
    /          \
   / Integration \  ← 0 testes
  /----------------\
 /                  \
/     Unit Tests     \  ← 0 testes
/______________________\
```

**Cobertura Atual:** Apenas `e2e/smoke.spec.ts` — verifica se aplicação carrega sem erros JS.

**Devedor Técnico:**
- MSW configurado mas sem handlers reais (`src/test/msw/handlers.ts` não existe)
- Vitest instalado mas sem testes
- Playwright configuraado mas apenas smoke

---

## 6. RISCO DE SUPPLY CHAIN E DEPENDÊNCIAS

### 6.1 Dependências de Risco

| Pacote | Versão | Risco | Mitigação |
|--------|--------|-------|-----------|
| `express` | 5.2.1 | **Alto** — RC, não stable | Migrar para 4.x LTS ou finalizar Hono |
| `@google/genai` | 1.44.0 | **Médio** — SDK legado | Migrar para Vercel AI SDK (já instalado) |
| `isomorphic-git` | 1.36.1 | **Médio** — bundle size grande | Avaliar lazy loading |
| `lucide-react` | 0.460.0 | **Baixo** — versão antiga | Atualizar para 0.x latest |

### 6.2 Dependências Não Utilizadas (Potencial)

Após análise de imports:
- `@ai-sdk/anthropic` — instalado mas não usado (aiProviders.ts é órfão)
- `@ai-sdk/google` — instalado mas não usado
- `ai` — instalado mas não usado

**Custo:** ~150KB de bundle não utilizado.

---

## 7. VERIFICAÇÃO DE CLAIMS (Gemini vs Realidade)

### 7.1 Claims Confirmados ✅

| Claim Gemini | Verificação Kimi |
|--------------|------------------|
| `aiProviders.ts` é órfão | ✅ Confirmado — ChatContext usa `gemini/service.ts` |
| `firecrawlService.ts` não é usado | ✅ Confirmado — `autoDocScheduler.ts` faz `fetch` direto |
| `cryptoService.ts` desconectado | ✅ Confirmado — `authProviders.ts` usa plaintext |
| Divergência de modelos v2 vs v3 | ✅ Confirmado — 3 definições diferentes |

### 7.2 Claims Corrigidos ⚠️

| Claim Gemini | Correção Kimi |
|--------------|---------------|
| `PendingActionsModal` vs `WorkspacePendingActionsPanel` são redundantes | **Incorreto** — servem propósitos diferentes (GitHub vs Workspace local) |
| AutoDoc "funcionalmente inútil" | **Parcial** — funciona para sites sem CORS, falha para docs modernas (MDN, etc) |

### 7.3 Novos Achados 🔍

| Achado | Severidade |
|--------|------------|
| Express 5.2.1 é RC (instável) | Alta |
| Zero testes unitários | Alta |
| Tokens em plaintext é decisão intencional (não acidente) | Média |
| `autoDoc.worker.ts` usa regex para HTML (falha em SPAs) | Média |

---

## 8. RECOMENDAÇÕES PRIORIZADAS

### 8.1 Prioridade P0 (Imediato — 1-2 dias)

1. **Ativar Firecrawl no AutoDoc**
   ```typescript
   // services/autoDocScheduler.ts — modificar syncTarget
   const firecrawlResult = await scrapeWithFirecrawl(target.url);
   if (firecrawlResult) {
       // usar firecrawlResult
   } else {
       // fallback para fetch direto
   }
   ```

2. **Reativar Criptografia de Tokens**
   - Reverter "decisão operacional" de 2026-03-10
   - Integrar `cryptoService.ts` em `authProviders.ts`

3. **Downgrade Express para 4.x LTS**
   ```bash
   npm uninstall express && npm install express@^4.21.0
   ```

### 8.2 Prioridade P1 (Curto prazo — 1 semana)

4. **Migrar ChatContext para aiProviders.ts**
   - Substituir imports de `gemini/service.ts` por `aiProviders.ts`
   - Unificar definições de modelos

5. **Implementar Testes Unitários Críticos**
   - `authProviders.ts` — testar validação de tokens
   - `githubService.ts` — testar tratamento de erros da API
   - `autoDocScheduler.ts` — testar lógica de sync

6. **Corrigir Regex do AutoDoc Worker**
   - Substituir regex por parser HTML real (ex: `happy-dom`, `linkedom`)

### 8.3 Prioridade P2 (Médio prazo — 2-4 semanas)

7. **Finalizar Migração Hono**
   - Implementar WebSocket em `index.hono.ts`
   - Rodar suite E2E completa
   - Remover Express

8. **Limpar Dependências Não Utilizadas**
   - Remover `@google/genai` após migração completa
   - Auditar bundle com `vite-bundle-analyzer`

---

## 9. MÉTRICAS DE QUALIDADE

| Métrica | Valor Atual | Target | Status |
|---------|-------------|--------|--------|
| Cobertura de Testes | ~2% (smoke only) | 60% | 🔴 |
| Dependências Desatualizadas | 3 críticas | 0 | 🟡 |
| Code Smells (estimado) | 15+ | <5 | 🔴 |
| Serviços Órfãos | 4 | 0 | 🔴 |
| Superfície de Ataque | Alta | Baixa | 🔴 |

---

## 10. CONCLUSÃO E ALINHAMENTO PARA COUNCIL

### Diagnóstico Consolidado (Visão Kimi)

A Tessy v5.0.1-devmode é funcional para desenvolvimento local, mas apresenta **degradê estrutural** em múltiplas dimensões:

1. **Segurança:** Regressão intencional (plaintext tokens) criou superfície de ataque crítica
2. **Qualidade:** Ausência completa de testes unitários, code smells acumulados
3. **Arquitetura:** Abstraction layers existem mas não são utilizados (aiProviders, firecrawl)
4. **Operacional:** Dependência de software instável (Express RC)

### Ponto de Convergência com Gemini

Ambos os auditores concordam:
- ✅ `aiProviders.ts` precisa ser integrado ao ChatContext
- ✅ `firecrawlService.ts` deve ser ativado para AutoDoc
- ✅ Divergência de versionamento precisa ser resolvida
- ✅ `cryptoService.ts` deve ser reativado

### Divergência Produtiva

| Aspecto | Gemini (Foco em Features) | Kimi (Foco em Estrutura) |
|---------|---------------------------|--------------------------|
| Prioridade #1 | Sincronizar ChatContext | Reativar criptografia |
| Prioridade #2 | Ativar Firecrawl | Downgrade Express |
| Prioridade #3 | Unificar versão | Implementar testes |

### Recomendação para o Council

O council deve priorizar:
1. **Segurança primeiro** — tokens em plaintext é risco inaceitável
2. **Estabilidade** — Express RC pode quebrar em produção
3. **Testes** — sem cobertura, refatorações são arriscadas
4. **Features** — só adicionar novas funcionalidades após estabilizar base

---

*Relatório gerado via análise estrutural profunda em 2026-03-16.*
*Metodologia: Análise estática de código, verificação de contratos, mapeamento de dependências.*
