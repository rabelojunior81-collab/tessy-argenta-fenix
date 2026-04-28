# Phase 4: Tessy AI - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4: Configuração do superproject GitHub para o exossistema Rabelus.

**ESCOPO REAL DESTA FASE:** Infraestrutura de sincronização do metarepo `tessy-argenta-fenix` com seus 3 módulos L1 (`tessy-antigravity-rabelus-lab`, `inception-v2`, `inception-tui`). 

**FORA DE ESCOPO (deferred para nova fase no roadmap):** Chat interface, AI providers, streaming, context window, tool execution. Essas capacidades serão tratadas em uma nova fase separada (Phase 4b ou 5, a definir no roadmap).

</domain>

<decisions>
## Implementation Decisions

### Superproject GitHub Sync
- **D-00:** O root `tessy-argenta-fenix` será configurado como repositório GitHub oficial contendo TODO o conteúdo do workspace (root + módulos).
- **D-00a:** Os 3 módulos L1 mantêm seus repositórios individuais no GitHub como mirrors independentes:
  - `tessy-antigravity-rabelus-lab` → github.com/rabelojunior81-collab/tessy-antigravity-rabelus-lab
  - `inception-v2` → github.com/rabelojunior81-collab/inception-v2-rabelus.git
  - `inception-tui` → github.com/rabelojunior81-collab/inception-method.git
- **D-00b:** Mecanismo de replicação bidirecional obrigatório: alterações no root são replicadas para os repos individuais; alterações nos repos individuais podem ser sincronizadas de volta ao root.
- **D-00c:** O root NÃO usará git submódulos tradicionais — os diretórios dos módulos permanecem como cópias reais no root (monorepo), com sync automatizado para os repos individuais.
- **D-00d:** O repo `tessy-argenta-fenix` já existe no GitHub (criado pelo Codex anteriormente) e será sobrescrito/reconfigurado com a estrutura correta.

### Conflitos e Merge
- **D-02:** Conflitos entre root e módulo **bloqueiam** o sync e exigem resolução manual. Nenhuma estratégia automática de merge — o usuário resolve explicitamente.

### Frequência do Sync
- **D-03:** Sync é **híbrido**:
  - **Push**: Automático via git hook (quando commita no root, replica para módulos)
  - **Pull**: Manual (quando altera no módulo individual, o usuário traz para o root)

### .gitignore e Arquivos
- **D-04:** **Tudo incluído** no superproject, exceto:
  - Secrets, tokens, dados confidenciais (`.env`, tokens de API, chaves)
  - `node_modules/`, `dist/`, `build/` (básico do gitignore)
  - Pastas de agentes (`.claude/`, `.codex/`, `.gemini/`, `.kilo/`, `.opencode/`) **VÃO SIM** para o GitHub
  - `.planning/` **VAI** para o GitHub

### Branches
- **D-05:** Root tem **apenas `master`**. Cada módulo mantém suas próprias branches nos repos individuais.

### Workflow de Replicação
- **D-06:** Workflow automático para push:
  1. Altera arquivo no diretório do módulo dentro do root
  2. Auto-commit no módulo com mensagem padronizada (`sync: auto-commit from superproject`)
  3. Auto-push do módulo para repo individual no GitHub
  4. Commit no root com referência ao sync (`sync: update [nome-do-modulo]`)

### Estrutura de Git
- **D-07:** Manter estrutura atual: cada diretório de módulo tem seu `.git` independente, root tem `.git` independente, **sem `.gitmodules`**. O erro "no submodule mapping found" é aceitável/ignorado.

### Documentação
- **D-08:** Documentação do sync em **MÚLTIPLOS lugares**:
  - `AGENTS.md` (para agents internos)
  - `SYNC.md` na raiz (referência rápida)
  - `.planning/phases/04-tessy-ai/` (contexto da fase)
  - `README.md` do repo no GitHub (documentação pública)

### the agent's Discretion
- Formato exato das mensagens de commit de sync (desde que padronizado)
- Estrutura do hook git (pre-commit, pre-push, ou post-commit)
- Implementação do script de sync (PowerShell, Bash, ou ambos)
- Frequência exata do sync automático (a cada commit ou a cada push)

</decisions>

<canonical_refs>
## Canonical References

### Planejamento
- `.planning/ROADMAP.md` — Define o objetivo original da Phase 4 (AI) e a estrutura de fases.
- `.planning/PROJECT.md` — Define o root como metaprojeto e os módulos L1 como repos de primeira classe.
- `.planning/REQUIREMENTS.md` — TESSY-13 a TESSY-17 (deferred para nova fase).
- `.planning/STATE.md` — Estado atual: Phase 3 completa, Phase 4 pronta.

### Contexto de Fases Anteriores
- `.planning/phases/01-tessy-foundation/01-CONTEXT.md` — Decisões de Phase 1 (terminal, editor, SPA).
- `.planning/phases/03-tessy-github/03-CONTEXT.md` — Decisões de Phase 3 (OAuth, YOLO, worktree).

### Módulos
- `tessy-antigravity-rabelus-lab/` — Repo individual: github.com/rabelojunior81-collab/tessy-antigravity-rabelus-lab
- `inception-v2/` — Repo individual: github.com/rabelojunior81-collab/inception-v2-rabelus.git
- `inception-tui/` — Repo individual: github.com/rabelojunior81-collab/inception-method.git

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Estrutura de diretórios já existe no root: `tessy-antigravity-rabelus-lab/`, `inception-v2/`, `inception-tui/`
- Cada módulo tem seu próprio `.git/` e remote configurado
- O root tem `.git/` mas sem remote configurado
- Repo `tessy-argenta-fenix` já existe no GitHub

### Established Patterns
- Módulos operam como repos git independentes dentro do workspace
- GitHub repos individuais já existem para os 3 módulos
- O root funciona como workspace operacional/metarepo mas sem ligação oficial ao GitHub
- `.planning/phases/` já existe com estrutura de fases anteriores

### Integration Points
- Root precisa de remote apontando para github.com/rabelojunior81-collab/tessy-argenta-fenix
- Workflow de sync deve respeitar a independência dos módulos
- O hook de sync deve ser instalado no `.git/hooks/` do root
- O script de sync deve detectar alterações nos diretórios dos módulos

</code_context>

<specifics>
## Specific Ideas

- O usuário foi explícito: quer o repo root no GitHub contendo TUDO, e ao mesmo tempo os módulos replicados em seus repos individuais.
- Não quer submódulos git tradicionais — quer o conteúdo real no root.
- Não quer discutir ou modificar qualquer aspecto de chat/AI nesta fase.
- Conflitos devem bloquear e exigir resolução manual (máximo controle).
- Sync deve ser híbrido: automático para push, manual para pull.
- Documentação deve ser redundante (múltiplos locais) para garantir que não se perde.

</specifics>

<deferred>
## Deferred Ideas

### AI/Chat (nova fase a ser criada no roadmap)
As seguintes gray areas foram identificadas para a Phase 4 original (Tessy AI) mas foram explicitamente deferidas pelo usuário para uma nova fase no roadmap:

- **Chat Interface Placement** — Onde o chat vive? Painel lateral? Aba? Flutuante? Como interage com editor/terminal?
- **AI Provider Configuration** — Como usuário adiciona API keys? Per-provider? Global? Onde armazenar? (Claude, Gemini, OpenAI)
- **Streaming Visualization** — Real-time token display? Typing indicator? Smooth scroll ou chunk-based?
- **Context Window Management** — Budget de tokens visível? Auto-truncate ou aviso? Qual o limite padrão?
- **Tool Execution Model** — Quais ferramentas (read file, run command, others)? Como usuário aprova/revisa tool calls?
- **Requisitos TESSY-13 a TESSY-17** permanecem pendentes e devem ser mapeados para a nova fase.

**AÇÃO NECESSÁRIA:** Criar nova fase no roadmap (sugestão: Phase 4b ou renumerar para Phase 5) para cobrir AI/Chat, e ajustar a numeração das fases subsequentes.

</deferred>

---

*Phase: 04-tessy-ai*
*Context gathered: 2026-04-22*
*Note: Phase scope pivoted from AI to Superproject GitHub Sync per user decision*
