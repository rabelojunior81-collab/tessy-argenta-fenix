# TASK MANIFEST
## Missão: ptbr-documentation-enforcement-2026-03
**Sprint ID:** `ptbr-documentation-enforcement-2026-03`

> Cada tarefa é atômica: um arquivo, uma mudança, um commit.
> Seguir ordem dos grupos: A → B → C → Z

---

## GRUPO A — Scripts (Risco: BAIXO)

### TASK-A1 — Traduzir comentários de `scripts/release.mjs` para pt-BR

**Objetivo:** Todo o JSDoc de cabeçalho e todos os comentários `// ---` inline devem estar em Português do Brasil.

**Arquivo:** `scripts/release.mjs`

**O que traduzir:**
- JSDoc completo (linhas 2-14): "Automates version bump...", "Usage:", "Example:" → pt-BR
- Todos os comentários `// ---` de seção: "Args", "Read current version", "Calculate new version", "Update package.json", "Update VERSION.md", "Update App.tsx footer", "Atomic commit", "Git tag" → pt-BR
- Comentário inline "Update version number lines", "Match: Tesseract vX.X.X..." → pt-BR
- Comentário "Add a new [Unreleased] section at the top for future entries" → pt-BR

**Strings de saída** (`console.log`/`console.error`/`console.warn`) — também traduzir:
- "Invalid bump type. Use: patch | minor | major" → pt-BR
- "Missing codename..." → pt-BR
- "Bumping X → Y (Z)" → pt-BR
- "Codename:", "Date:" → pt-BR
- "Could not find version banner in App.tsx — skipping..." → pt-BR
- "[Unreleased] section not found..." → pt-BR
- "Creating atomic commit..." → pt-BR
- "Commit created", "Tag vX.X.X created" → pt-BR
- "Release vX.X.X complete!" → pt-BR
- "Run: npm run validate-version to confirm..." → pt-BR

**Verificação:**
```bash
npx tsc --noEmit   # deve passar (scripts não são compilados pelo tsc, mas verificar)
node scripts/release.mjs 2>&1 | head -3   # deve imprimir mensagem de erro em pt-BR
```

**Critérios de aceite:**
- [ ] Nenhum comentário ou string de saída em inglês
- [ ] Script ainda executa corretamente (`node scripts/release.mjs patch teste` deve funcionar em dry mode)

**Risco:** BAIXO — apenas comentários e strings, sem lógica

**Commit:**
```bash
git commit -m "TSP: [A1] scripts/release.mjs — comentários e strings para pt-BR"
```

---

### TASK-A2 — Traduzir comentários de `scripts/validate-version.mjs` para pt-BR

**Objetivo:** Todo o JSDoc e comentários inline em Português do Brasil.

**Arquivo:** `scripts/validate-version.mjs`

**O que traduzir:**
- JSDoc de cabeçalho: "Validates that all 4 version sources are in sync", "Usage:", "Exit codes:", "all sources in sync", "divergence detected" → pt-BR
- Comentários de seção: "Read package.json", "Check VERSION.md", "Check App.tsx footer", "Check CHANGELOG.md", "Find the first versioned header", "Summary" → pt-BR
- Strings de saída (`console.log`/`console.error`):
  - "Validating version consistency (Gate G5)" → pt-BR
  - "Reference (package.json): vX" → pt-BR
  - "VERSION.md: could not find..." → pt-BR
  - "App.tsx: could not find..." → pt-BR
  - "CHANGELOG.md: could not find..." → pt-BR
  - "CHANGELOG.md latest release: vX ≠ package.json vY" → pt-BR
  - "Version divergence detected. Run:..." → pt-BR
  - "All sources in sync at vX — Gate G5 PASSED" → pt-BR

**Critérios de aceite:**
- [ ] Nenhum comentário ou string de saída em inglês
- [ ] `npm run validate-version` ainda executa corretamente

**Risco:** BAIXO

**Commit:**
```bash
git commit -m "TSP: [A2] scripts/validate-version.mjs — comentários e strings para pt-BR"
```

---

## GRUPO B — Documentação (Risco: BAIXO)

### TASK-B1 — Traduzir `README.md` inteiramente para pt-BR

**Objetivo:** README completamente em PT-BR.

**Arquivo:** `README.md`

**Seções a traduzir:**
- `## About` → `## Sobre`
- `## Current Architecture` → `## Arquitetura Atual`
- Link `ARCHITECTURE.md` mantém nome do arquivo mas texto do parágrafo em pt-BR
- `## Getting Started` → `## Como Iniciar`
- `## Development` → `## Desenvolvimento`
- Todos os parágrafos e bullet points em inglês → pt-BR
- Manter termos técnicos: "Local-First", "IndexedDB", "PTY", "broker", "React", etc.

**Critérios de aceite:**
- [ ] Nenhuma seção ou parágrafo em inglês
- [ ] Termos técnicos sem tradução consolidada mantidos como estão

**Risco:** BAIXO

**Commit:**
```bash
git commit -m "TSP: [B1] README.md — tradução completa para pt-BR"
```

---

### TASK-B2 — Auditar e corrigir `AGENT_PRIMER.md` (raiz e espelho)

**Objetivo:** Garantir que não há nenhum trecho residual em inglês + adicionar seção "REGRA DE OURO — LÍNGUA".

**Arquivos:** `AGENT_PRIMER.md` (raiz) + `.agent/AGENT_PRIMER.md` (espelho)

**Ações:**
1. Ler o arquivo completo e identificar qualquer trecho em inglês residual
2. Corrigir todos os trechos encontrados
3. Adicionar nova seção após "REGRAS NÃO-NEGOCIÁVEIS":

```markdown
## REGRA DE OURO — LÍNGUA

> **TODA documentação, comentários de código, strings de saída de scripts, mensagens de erro/sucesso e arquivos de governança deste repositório DEVEM estar em Português do Brasil (pt-BR), sem exceção.**

**Permitido em inglês (apenas):**
- Identificadores de código: variáveis, funções, classes, tipos TypeScript
- Strings de API e campos JSON que interagem com sistemas externos
- Termos técnicos sem tradução consolidada: "commit", "branch", "merge", "lint", "hook", "codename"
- Código de produto React/TypeScript existente (não alterar código de produto)

**Proibido em inglês:**
- Comentários `//` e `/* */` em scripts e arquivos de configuração
- JSDoc / docstrings
- Strings de `console.log`, `console.error`, mensagens de saída
- Seções, títulos, parágrafos de documentação `.md`
- Arquivos de protocolo `.agent/protocols/`
- Mensagens de commit (usar pt-BR exceto termos técnicos)
```

4. **Sincronizar espelho:** copiar `AGENT_PRIMER.md` da raiz para `.agent/AGENT_PRIMER.md`

**Critérios de aceite:**
- [ ] Nenhum trecho em inglês fora das exceções permitidas
- [ ] Seção "REGRA DE OURO — LÍNGUA" presente e visível
- [ ] Raiz e espelho são idênticos

**Risco:** BAIXO

**Commit:**
```bash
git commit -m "TSP: [B2] AGENT_PRIMER.md — pt-BR completo + Regra de Ouro de Língua"
```

---

### TASK-B3 — Auditar `VERSIONING.md` e demais arquivos de protocolo

**Objetivo:** Confirmar que `.agent/protocols/VERSIONING.md` está inteiramente em pt-BR. Fazer auditoria rápida dos outros protocolos (TDP, TMP, TSP, CANON).

**Arquivos:** `.agent/protocols/VERSIONING.md` (principal), TDP, TMP, TSP, CANON (auditoria)

**Ações:**
1. Ler `VERSIONING.md` completo e corrigir quaisquer trechos em inglês
2. Grep rápido em TDP/TMP/TSP/CANON por blocos de texto em inglês (não código)

**Critérios de aceite:**
- [ ] `VERSIONING.md` inteiramente em pt-BR
- [ ] Nenhum bloco de texto em inglês encontrado nos outros protocolos

**Risco:** BAIXO

**Commit:**
```bash
git commit -m "TSP: [B3] VERSIONING.md e protocolos — auditoria pt-BR"
```

---

## GRUPO C — Inscrever Regra de Ouro nos protocolos (Risco: BAIXO)

### TASK-C1 — Inscrever Regra de Ouro no TDP.md

**Objetivo:** A Regra de Ouro de Língua deve estar no protocolo fundacional.

**Arquivo:** `.agent/protocols/TDP.md`

**Ação:** Localizar a seção de princípios não-negociáveis ou regras de desenvolvimento e inserir:

```markdown
### Princípio G — Língua: Português do Brasil Obrigatório

**Toda documentação, comentários de código, strings de saída de scripts e arquivos de governança devem estar em Português do Brasil (pt-BR), sem exceção.**

Ver regra completa em `AGENT_PRIMER.md` → seção "REGRA DE OURO — LÍNGUA".

Violação desta regra = gate G0 REPROVADO → missão deve corrigir antes de avançar.
```

**Critérios de aceite:**
- [ ] Seção de língua presente no TDP
- [ ] Vinculada ao AGENT_PRIMER

**Risco:** BAIXO — adição de texto, sem remoção

**Commit:**
```bash
git commit -m "TSP: [C1] TDP.md — Regra de Ouro pt-BR inscrita como princípio"
```

---

### TASK-C2 — Adicionar gate de língua ao TMP.md

**Objetivo:** O protocolo de missões deve exigir verificação de língua antes do fechamento.

**Arquivo:** `.agent/protocols/TMP.md`

**Ação:** Localizar a seção de gates ou checklist de fechamento de missão e inserir:

```markdown
### Gate G0 — Língua pt-BR

**Antes de fechar qualquer missão**, verificar:
- [ ] Todos os arquivos criados ou modificados na missão estão em pt-BR
- [ ] Nenhum comentário de código em inglês nos arquivos de scripts/docs
- [ ] Strings de saída de scripts em pt-BR

Comando de verificação rápida:
```bash
# Checar comentários em inglês em scripts criados
grep -n "// " scripts/<arquivo>.mjs | grep -v "[áéíóúàãõâêîôûç]" | head -20
```

Divergência → corrigir antes do commit final.
```

**Critérios de aceite:**
- [ ] Gate G0 de língua presente no TMP

**Risco:** BAIXO

**Commit:**
```bash
git commit -m "TSP: [C2] TMP.md — gate G0 de verificação de língua pt-BR"
```

---

## GRUPO Z — FECHAMENTO (Obrigatório)

### TASK-Z1 — Validar gates e fechar missão

**Objetivo:** Confirmar que todos os gates passam.

```bash
npx tsc --noEmit                    # G1: zero erros
npm run validate-version            # G5: versão sincronizada
git diff --name-only main           # G6: apenas docs/scripts/.agent/
```

**Critérios de aceite:**
- [ ] G1 ✅
- [ ] G5 ✅
- [ ] G6 ✅ (zero arquivos de produto alterados)

**Risco:** BAIXO

**Commit:**
```bash
git commit -m "TSP: [Z1] gates validados — missão ptbr-enforcement concluída"
```

---

### TASK-Z2 — Atualizar CHANGELOG.md e abrir PR

**Objetivo:** Registrar a missão e abrir PR para Adilson.

**Arquivo:** `CHANGELOG.md` — adicionar na seção `[Unreleased]`

**Conteúdo:**
```markdown
### Enforcement de Língua pt-BR - 2026-03-18+
- **Missão:** `ptbr-documentation-enforcement-2026-03`
- Tradução completa de `scripts/release.mjs` e `scripts/validate-version.mjs` para pt-BR
- Tradução completa de `README.md` para pt-BR
- `AGENT_PRIMER.md`: Regra de Ouro de Língua inscrita como seção obrigatória
- `TDP.md`: Princípio G adicionado (língua pt-BR obrigatório)
- `TMP.md`: Gate G0 de língua adicionado ao checklist de fechamento
```

**Commit + PR:**
```bash
git commit -m "TSP: [Z2] CHANGELOG atualizado — missão ptbr-enforcement"
git push -u origin feature/ptbr-documentation-enforcement-2026-03
gh pr create --title "docs: enforcement pt-BR + Regra de Ouro nos protocolos"
```

---

## RESUMO EXECUTIVO

| Tarefa | Grupo | Risco | Prioridade | Dependências |
|--------|-------|-------|------------|--------------|
| A1 — release.mjs pt-BR | A | BAIXO | ALTA | Nenhuma |
| A2 — validate-version.mjs pt-BR | A | BAIXO | ALTA | Nenhuma |
| B1 — README.md pt-BR | B | BAIXO | ALTA | Nenhuma |
| B2 — AGENT_PRIMER.md + Regra de Ouro | B | BAIXO | ALTA | Nenhuma |
| B3 — VERSIONING.md + auditoria protocolos | B | BAIXO | MÉDIA | Nenhuma |
| C1 — TDP: Princípio G pt-BR | C | BAIXO | ALTA | B2 |
| C2 — TMP: Gate G0 pt-BR | C | BAIXO | ALTA | B2 |
| Z1 — Validar gates | Z | BAIXO | ALTA | Todos |
| Z2 — CHANGELOG + PR | Z | BAIXO | ALTA | Z1 |
