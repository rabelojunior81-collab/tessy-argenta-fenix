# MISSION BRIEFING
## ID: repo-sanitization-governance-2026-03
## Status: AGUARDANDO_EXECUCAO
## Data de Criação: 2026-03-18
## Criado por: Claude Sonnet 4.6 (sessão de planejamento)
## Prioridade: ALTA
## Branch: feature/repo-sanitization-governance-2026-03

---

## CONTEXTO E MOTIVAÇÃO

O repositório `tessy-antigravity-rabelus-lab` acumulou entropia estrutural ao longo de múltiplas missões executadas por diferentes agentes (Claude, Kimi, OpenCode, Grok). Apesar de uma governança formalmente excelente (TDP/TMP/TSP), três camadas de problema persistem:

1. **Metodologia inacessível**: As "leis" do projeto (TDP, TMP, TSP, Canon) estão espalhadas em `.agent/` e `docs/` sem hierarquia clara. Qualquer agente novo tem que vasculhar 3+ locais para entender as regras antes de agir. Isso é a causa raiz de todos os desvios.

2. **Produto misturado com desenvolvimento**: Não há separação clara entre "o que Tessy É" (produto React) e "como Tessy É FEITA" (governança, missões, docs, scripts). Tanto na estrutura quanto na documentação.

3. **Versionamento não automatizado**: package.json, VERSION.md, App.tsx footer e CHANGELOG são atualizados manualmente — e nunca todos de uma vez. Gate G5 existe no TDP mas não tem enforcement técnico. Resultado: sempre dessincroniza.

**Instrução do Adilson (proprietário):**
> "Quero uma sanitização mais profunda no repositório. Precisamos segregar o que será de fato parte do Desenvolvimento da Tessy e o que será o 'produto' Tessy. Organizar, otimizar e automatizar melhor a documentação do desenvolvimento. Que não saia dos trilhos, mesmo designando para outros agentes."

---

## OBJETIVOS

### O1 — Criar AGENT_PRIMER.md (porta de entrada universal)
Arquivo único na raiz do repo que qualquer agente lê PRIMEIRO. Uma página que:
- Explica o que é Tessy e o Rabelus Lab
- Lista as regras não-negociáveis (links para TDP, TMP, TSP)
- Explica a separação Produto / Desenvolvimento
- Declara o que NUNCA fazer (sem --unsafe, sem merge sem aprovação, etc.)
- É o "contrato de onboarding" para todo agente novo

### O2 — Reorganizar `.agent/` com hierarquia clara
```
.agent/
├── AGENT_PRIMER.md          ← cópia espelhada do da raiz
├── protocols/               ← AS LEIS (imutáveis sem aprovação de Adilson)
│   ├── TDP.md               (mover/renomear de TESSY_DEV_PROTOCOL.md)
│   ├── TMP.md               (mover/renomear de MISSION_PROTOCOL.md)
│   ├── TSP.md               (mover/renomear de workflows/safe-development.md)
│   ├── VERSIONING.md        ← CRIAR: política explícita de versionamento
│   └── CANON.md             ← MOVER de docs/rabelus-lab-methodology/RABELUS_LAB_GOVERNANCE_CANON.md
├── skills/                  (inalterado — não tocar)
├── missions/
│   ├── _template/           (inalterado — não tocar)
│   ├── active/              ← CRIAR subpasta; mover missões concluídas para journal
│   └── journal/             (inalterado — imutável)
└── governance/
    └── governance-status.md ← MOVER de docs/governance-status.md
```

**Missões concluídas a arquivar** (estão em `.agent/missions/` mas deveriam estar em `journal/`):
- `autodoc-gemini-url-context-2026-03` → journal
- `firecrawl-auth-integration-2026-03` → journal
- `gemini-advanced-features-and-autodoc-fallback-2026-03` → journal
- `governance-normalization-v5-2026-03` → journal
- `toolcalling-workspace-lint-fix-2026-03` → journal
- `tdd-first-suite-2026-03` → manter em active/ (AGUARDANDO_EXECUCAO)

### O3 — Reorganizar `docs/` com hierarquia clara
```
docs/
├── architecture/            ← MOVER ARCHITECTURE.md aqui + assets/
│   ├── ARCHITECTURE.md
│   ├── tessy_architecture_infographic.md
│   └── assets/              (screenshots, imagens)
├── audits/                  ← MOVER todos os arquivos audit-*.md e auditoria-*.md
│   ├── 2026-03-07-tessy-v4.6.1.md
│   ├── 2026-03-16-gemini.md
│   ├── 2026-03-16-kimi.md
│   ├── 2026-03-17-grok.md
│   ├── 2026-03-18-opencode.md
│   └── self_audit_tessy.md
├── incidents/               ← MOVER incidente-pos-missao-2026-03-07.md
├── methodology/             ← RENOMEAR de rabelus-lab-methodology/
│   └── SANITIZATION_AUDIT_2026-03-07.md (manter INDEX.md)
├── experiments/             ← RENOMEAR de archive/gemini-experiments/
│   └── (arquivos existentes)
└── legacy-data/             (inalterado)
```

### O4 — Criar `scripts/release.mjs` (automação G5)
Script Node.js que ao receber `node scripts/release.mjs patch tessy-lint-pass`:
1. Lê versão atual de `package.json`
2. Calcula nova versão (patch/minor/major)
3. Atualiza `package.json` version
4. Atualiza `VERSION.md` (versão + codename + data)
5. Atualiza banner de versão em `App.tsx` (linha com "Tesseract vX.X.X")
6. Move seção `[Unreleased]` do `CHANGELOG.md` para `[vX.X.X-codename] - YYYY-MM-DD`
7. Faz commit atômico: `TSP: [RELEASE] bump vX.X.X-codename`
8. Cria git tag `vX.X.X`

Adicionar ao `package.json`:
```json
"scripts": {
  "release": "node scripts/release.mjs",
  "validate-version": "node scripts/validate-version.mjs"
}
```

### O5 — Criar `scripts/validate-version.mjs` (enforcement G5)
Script que valida que package.json, VERSION.md, App.tsx footer e CHANGELOG estão todos na mesma versão. Retorna exit code 1 se divergência. Pode ser usado como pre-commit hook ou em CI.

### O6 — Criar `VERSIONING.md` em `.agent/protocols/`
Documento explícito declarando:
- Quando bumpar PATCH (bug fixes, lint, sanitização)
- Quando bumpar MINOR (feature nova, integração completa de subsistema)
- Quando bumpar MAJOR (quebra arquitetural, reescrita)
- Convenção de codename
- Processo de release passo a passo
- Como usar `npm run release`

### O7 — Executar bump de versão para v5.0.3
Usando o novo script `release.mjs`, executar:
```
node scripts/release.mjs patch toolcalling-lint-pass
```
Resultado esperado: todas as fontes sincronizadas em v5.0.3-toolcalling-lint-pass.

### O8 — Atualizar README.md e CONTRIBUTING.md
- README.md: adicionar referência ao AGENT_PRIMER.md
- CONTRIBUTING.md: mencionar o processo TMP/TDP para contribuidores externos

---

## O QUE NÃO FAZER (CRÍTICO)

- **NÃO tocar** em nenhum arquivo de código: `components/`, `services/`, `contexts/`, `hooks/`, `App.tsx`, `index.html`, `index.tsx`, `types.ts`, `index.css`
- **NÃO deletar** nada — apenas arquivar/mover
- **NÃO renomear** `.agent/` (referenciado em toda a documentação)
- **NÃO usar** `biome --unsafe`
- **NÃO mergear** sem aprovação explícita de Adilson
- **NÃO modificar** arquivos em `.agent/missions/journal/` (imutáveis por protocolo)
- **NÃO alterar** a estrutura do barramento de missões _template/

---

## GRUPOS DE EXECUÇÃO (TSP)

### Grupo A — Infraestrutura de governança
- A1: Criar `.agent/protocols/` e mover/renomear TDP, TMP, TSP, CANON
- A2: Criar `.agent/governance/` e mover governance-status.md
- A3: Arquivar missões concluídas em journal/
- A4: Criar `tdd-first-suite-2026-03/` em `active/` (manter)

### Grupo B — Documentação
- B1: Reorganizar `docs/` em audits/, architecture/, incidents/, experiments/, methodology/
- B2: Criar `AGENT_PRIMER.md` na raiz
- B3: Criar `.agent/AGENT_PRIMER.md` (espelho)
- B4: Atualizar `README.md` e `CONTRIBUTING.md`

### Grupo C — Automação
- C1: Criar `scripts/release.mjs`
- C2: Criar `scripts/validate-version.mjs`
- C3: Criar `.agent/protocols/VERSIONING.md`
- C4: Atualizar `package.json` scripts

### Grupo Z — Fechamento
- Z1: Executar `npm run release patch toolcalling-lint-pass` → v5.0.3
- Z2: Validar `npm run validate-version` → 0 divergências
- Z3: Validar `npx tsc --noEmit` e `npx biome check` → 0 erros
- Z4: Atualizar CHANGELOG com esta missão
- Z5: Commit final + push + PR

---

## GATES OBRIGATÓRIOS

| Gate | Critério | Método |
|------|----------|--------|
| G1 | TypeScript sem erros | `npx tsc --noEmit` → sem output |
| G4 | App funciona após reorganização | `npm run dev` inicia sem erros |
| G5 | Versão consistente | `npm run validate-version` → exit 0 |
| G6 | Nenhum arquivo de código alterado | `git diff --name-only` lista só docs/scripts/.agent/ |

---

## CRITÉRIO DE ACEITE

A missão está CONCLUÍDA quando:
1. `AGENT_PRIMER.md` existe na raiz e em `.agent/`
2. `.agent/protocols/` contém TDP.md, TMP.md, TSP.md, VERSIONING.md, CANON.md
3. `scripts/release.mjs` e `scripts/validate-version.mjs` funcionam
4. `npm run validate-version` retorna exit 0
5. `package.json`, `VERSION.md`, `App.tsx` footer e `CHANGELOG.md` todos mostram v5.0.3
6. Git tag `v5.0.3` existe
7. Missões concluídas estão em `journal/`
8. `docs/` está reorganizado com subpastas audits/, architecture/, incidents/
9. `npx tsc --noEmit` e `npx biome check` → 0 erros
10. PR aberto para revisão de Adilson

---

## CONTEXTO TÉCNICO

**Branch de trabalho:** `feature/repo-sanitization-governance-2026-03`
**Base:** `main` @ `36dd878`
**Versão atual:** 5.0.1 (package.json), 5.0.1 (VERSION.md), 4.9.1 (App.tsx footer — hardcoded, DESATUALIZADO)
**Versão alvo:** 5.0.3-toolcalling-lint-pass

**Arquivos-chave de referência:**
- `.agent/TESSY_DEV_PROTOCOL.md` — TDP completo (412 linhas)
- `.agent/MISSION_PROTOCOL.md` — TMP completo (334 linhas)
- `.agent/workflows/safe-development.md` — TSP
- `docs/rabelus-lab-methodology/RABELUS_LAB_GOVERNANCE_CANON.md` — Canon
- `CHANGELOG.md` — histórico completo (20KB)
- `App.tsx` linha ~253: `Tesseract v4.9.1 (Nucleus)` ← hardcoded, corrigir para usar variável

**Localização do banner de versão em App.tsx:**
```tsx
// App.tsx ~linha 253 (no footer)
<span style={{ color: 'var(--glass-accent)' }} className="uppercase hidden xs:inline">
  Tesseract v4.9.1 (Nucleus)
</span>
```
O script release.mjs deve usar regex para atualizar este valor.

---

## HEURÍSTICAS PARA O EXECUTOR

1. **Explore antes de agir**: Leia TDP, TMP e TSP completos antes de mover qualquer arquivo
2. **Arquivar ≠ deletar**: Mover para `journal/` ou subpasta, nunca `rm`
3. **Git mv**: Usar `git mv` para mover arquivos (preserva histórico)
4. **Commits atômicos por grupo**: Um commit por Grupo A, B, C, Z
5. **Testar release.mjs em dry-run**: Antes de executar, validar lógica com mock
6. **Verificar App.tsx depois**: Após release.mjs, confirmar visualmente que o footer mudou
7. **Não assumir estado**: Sempre `git status` antes de cada commit
