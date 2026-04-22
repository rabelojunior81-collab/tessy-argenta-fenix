# MISSION BRIEFING
## Missão: Version Display Fix
**Missão ID:** `version-display-fix-2026-03`
**Data de criação:** 2026-03-18
**Criado por:** Claude (Auditor - sessão de roadmap holístico)
**Status:** `AGUARDANDO_EXECUCAO`
**Repositório:** `e:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab`
**Branch base:** `main`

---

## 1. CONTEXTO

Esta missão corrige valores hardcoded de versão e build identificados no roadmap holístico. O objetivo é tornar o display de versão dinâmico, capturando valores reais do ambiente.

**Origem:** Roadmap holístico 2026-03-18, Épico 1 — Normalização de Rótulos e Versões

**Valores hardcoded encontrados:**
- `App.tsx:245` — `© 2025 Rabelus Lab System` (deve usar `new Date().getFullYear()`)
- `RealTerminal.tsx:225` — `Build 4.9.1` (deve ser dinâmico)

**Esta missão NÃO inclui:**
- Atualização de versão (isso é feito via `release.mjs`)
- Alterações em outras funcionalidades
- Mudanças na lógica de negócio

---

## 2. ARQUITETURA RELEVANTE

### 2.1 Processos envolvidos

| Processo | Entry point | Porta |
|---|---|---|
| Frontend SPA | `index.tsx` → `App.tsx` | 3000 |
| Terminal backend | `server/index.ts` | 3002 |

### 2.2 Localização dos pontos críticos

| Ponto de Mudança | Arquivo | Motivo |
|---|---|---|
| Copyright ano | `App.tsx` linha 245 | Hardcoded "2025" |
| Terminal build | `components/layout/RealTerminal.tsx` linha 225 | Hardcoded "Build 4.9.1" |

### 2.3 Como obter versão dinâmica

**Opção A — Via package.json (recomendada):**
```ts
import packageJson from '../package.json' with { type: 'json' };
const version = packageJson.version;
```

**Opção B — Via import.meta.env (Vite):**
Adicionar no `.env` ou `vite.config.ts`:
```ts
define: {
  'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
}
```

---

## 3. METODOLOGIA OBRIGATÓRIA — TESSY SAFETY PROTOCOL (TSP)

**Todo o trabalho deve seguir o TSP sem exceção.**

### 3.1 Pre-flight obrigatório

```bash
git status   # deve retornar working tree clean
git branch   # deve estar em main
```

### 3.2 Uma branch por grupo de tarefas

```bash
git checkout -b feature/version-display-fix
```

### 3.3 Commits atômicos por tarefa

```bash
git commit -am "TSP: [A1] Corrigir ano copyright em App.tsx"
git commit -am "TSP: [A2] Corrigir build display em RealTerminal.tsx"
```

### 3.4 Merge ou descarte

**Sucesso:**
```bash
git checkout main
git merge feature/version-display-fix --no-ff -m "TSP: Merge version-display-fix — versão dinâmica"
git branch -d feature/version-display-fix
```

**Falha:**
```bash
git checkout main
git branch -D feature/version-display-fix
```

---

## 4. REGRAS DE EXECUÇÃO

1. **Não modificar lógica de negócio** — apenas tornar valores dinâmicos
2. **Preservar formatação existente** — não usar biome --write
3. **Sempre verificar TypeScript após mudanças:** `npx tsc --noEmit`
4. **Manter compatibilidade** — o app deve continuar funcionando identicamente
5. **Em caso de dúvida:** pausar e registrar no REPORT_TEMPLATE.md

---

## 5. CRITERIO DE SUCESSO DA MISSÃO

A missão está completa quando:

- [ ] `npx tsc --noEmit` passa sem erros
- [ ] App.tsx usa `new Date().getFullYear()` para o ano
- [ ] RealTerminal.tsx exibe build dinâmico
- [ ] `npm run dev` inicia sem erro
- [ ] CHANGELOG.md atualizado
- [ ] REPORT_TEMPLATE.md preenchido

---

## 6. DOCUMENTOS DO BARRAMENTO

| Documento | Papel | Responsável |
|---|---|---|
| `MISSION_BRIEFING.md` (este) | Contexto e constraints | Agente Auditor (criado) |
| `TASK_MANIFEST.md` | Lista atômica de tarefas | Agente Auditor (criado) |
| `REPORT_TEMPLATE.md` | Template de entrega | Agente Auditor (criado) |
| `COMMUNICATION_PROTOCOL.md` | Regras do barramento | Agente Auditor (criado) |

---

## 7. REFERÊNCIAS

- Roadmap holístico: `.agent/HANDOFF.md`
- Protocolo raiz: `.agent/protocols/TMP.md`
- TDP gates: `.agent/protocols/TDP.md`
- VERSÃO.md: `VERSION.md`

---

## 8. SKILL DISCOVERY PROTOCOL

> **OBRIGATÓRIO PARA TODO AGENTE EXECUTOR**
>
> Agentes são instanciados sem ferramentas carregadas. Antes de executar QUALQUER
> grupo de tarefas, o executor DEVE carregar as skills necessárias via ToolSearch
> e verificar se estão operacionais.

### 8.1 Sequência de Carregamento Obrigatório

Execute na ordem, antes de tocar qualquer arquivo:

```
1. ToolSearch("select:Read,Edit,Write,Glob,Grep")
2. ToolSearch("select:Bash")
3. ToolSearch("select:TodoWrite")
```

### 8.2 Skills por Grupo de Tarefas

| Grupo | Tarefa | Skills Necessárias | ToolSearch Query |
|---|---|---|---|
| **A** — Correções | App.tsx e RealTerminal.tsx | Read, Edit, Bash | `"select:Read,Edit,Bash"` |
| **Z** — Pos-missão | Docs e cleanup | Read, Edit | `"select:Read,Edit"` |

### 8.3 Verificação de Atualidade das Skills

Após carregar, confirmar que a descrição inclui:
- `Read`: menciona PDF, imagens, notebooks
- `Edit`: menciona `replace_all`
- `Bash`: menciona `run_in_background`

Divergências → registrar em Log de Decisões do REPORT_TEMPLATE.md.

---

*Documento parte do barramento de missão `version-display-fix-2026-03`*
*Protocolo: `.agent/protocols/TMP.md`*