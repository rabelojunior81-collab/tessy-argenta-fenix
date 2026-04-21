# TESSY METHODOLOGY STANDARDS CONVERGENCE
## Matriz de Normalização para Colaboração Internacional
**Data:** 2026-03-13
**Escopo:** Análise comparativa entre metodologia atual e padrões internacionais
**Base:** `tessy-antigravity-rabelus-lab/`

---

## 1. METODOLOGIA ATUAL IDENTIFICADA

### 1.1 Inception Methodology (v1.0.0)

Metodologia proprietária criada pelo Rabelus Lab, agnóstica de stack, linguagem e tipo de agente.

| Componente | Sigla | Descrição |
|------------|-------|-----------|
| **Engineering Protocol** | IEP | Gates, contratos, padrões de qualidade |
| **Safety Protocol** | ISP | Pre-flight, commits atômicos, rollback |
| **Mission Protocol** | IMP | Barramento de missões, journal, handoff |

**Arquitetura de Missões (`.agent/`):**
```
.agent/
├── MISSION_PROTOCOL.md          # Protocolo raiz
├── TESSY_DEV_PROTOCOL.md         # Padrões de engenharia
├── workflows/
│   └── safe-development.md       # Definição formal do TSP
├── skills/                       # Skills de agente
├── missions/
│   ├── _template/                # Templates para novas missões
│   │   ├── MISSION_BRIEFING.md
│   │   ├── TASK_MANIFEST.md
│   │   ├── REPORT_TEMPLATE.md
│   │   └── COMMUNICATION_PROTOCOL.md
│   ├── <sprint-ativo>/           # Missão em execução
│   └── journal/                  # Missões arquivadas (imutáveis)
```

**Modos de Agente:**
| Modo | Papel | Ação |
|------|-------|------|
| A | Auditor | Criar missão |
| B | Executor | Implementar |
| C | Arquivista | Arquivar |
| D | Verificador | Ler e reportar (read-only) |

**Status Técnicos (TDP):**
- `RESOLVIDO`, `PARCIAL`, `STUB`, `RISCO_ACEITO`, `BLOQUEADO`

**Gates Obrigatórios (TDP):**
- G1: Type Safety (`tsc --noEmit`)
- G2: Persistência e Migração
- G3: Segurança e Permissão
- G4: UX e Smoke
- G5: Consistência de Release
- G6: Transparência de IA

### 1.2 Convenções de Nomenclatura Existentes

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Sprint ID | `<descricao-kebab>-<YYYY-MM>` | `filesystem-fix-omniscience-2026-03` |
| Branch | `<tipo>/<descricao-curta>` | `feature/filesystem-fix-omniscience` |
| Commit | `TSP: [TASK-ID] <descrição>` | `TSP: [A2] Fix dir='.'` |
| Arquivo journal | `<sprint-id>/` | `filesystem-fix-omniscience-2026-03/` |

---

## 2. REFERÊNCIAS INTERNACIONAIS

### 2.1 Semantic Versioning (SemVer)

**Resumo (semver.org):** `MAJOR.MINOR.PATCH`

| Tipo | Condição | Exemplo |
|------|----------|---------|
| **MAJOR** | API incompatível | 4.0.0 → 5.0.0 |
| **MINOR** | Funcionalidade nova retrocompatível | 5.0.0 → 5.1.0 |
| **PATCH** | Bug fix retrocompatível | 5.0.0 → 5.0.1 |

**Pré-release:** `5.0.1-alpha.1`, `5.0.1-beta.2`
**Build metadata:** `5.0.1+build.123`

### 2.2 Conventional Commits

**Formato:**
```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[footer(s) opcional]
```

**Tipos (angular/conventionais):**
- `feat` → MINOR
- `fix` → PATCH
- `BREAKING CHANGE` → MAJOR

**Tipos adicionais (recomendados):**
- `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`

### 2.3 Keep a Changelog

**Categorias:**
- Added (novas features)
- Changed (mudanças em funcionalidade existente)
- Deprecated (features soon-to-be removed)
- Removed (features removidas)
- Fixed (bug fixes)
- Security (vulnerabilidades)

**Formato de versão:**
```markdown
## [1.0.0] - 2026-03-13

### Added
- Nova feature X

### Fixed
- Bug Y
```

### 2.4 GitHub Flow

1. Criar branch (`feature/`, `fix/`, `hotfix/`)
2. Fazer commits com mensagens descritivas
3. Abrir Pull Request
4. Revisar e discutir
5. Merge na main
6. Deletar branch

### 2.5 GitHub Standard Files

| Arquivo | Propósito |
|---------|-----------|
| `LICENSE` | Licença MIT |
| `CONTRIBUTING.md` | Guia de contribuição |
| `CODE_OF_CONDUCT.md` | Código de conduta |
| `SECURITY.md` | Política de segurança |
| `.github/ISSUE_TEMPLATE/` | Templates de issues |
| `.github/PULL_REQUEST_TEMPLATE.md` | Template de PR |
| `.github/workflows/` | GitHub Actions CI |

---

## 3. MATRIZ DE CONVERGÊNCIA

| **Dimensão** | **Padrão Internacional** | **Estado Atual Tessy** | **Gap** | **Prioridade** | **Esforço** |
|--------------|--------------------------|------------------------|---------|----------------|-------------|
| **Versionamento** | SemVer (MAJOR.MINOR.PATCH) | Parcial: `5.0.1-devmode` (pré-release não-convencional) | Médio | Alta | Baixo |
| **Commits** | Conventional Commits (`feat:`, `fix:`, etc.) | Próprio: `TSP: [TASK-ID] descrição` | Alto | Média | Médio |
| **Changelog** | Keep a Changelog | Próprio: bem estruturado, categorias diferentes | Baixo | Baixa | Baixo |
| **Branching** | GitHub Flow / GitFlow | Feature branches → main ✓ | Baixo | Baixa | Nenhum |
| **CI/CD** | GitHub Actions | **AUSENTE** | Crítico | **Alta** | Médio |
| **LICENSE** | MIT (declarado) | **AUSENTE no repo** | Crítico | **Alta** | Baixo |
| **CONTRIBUTING.md** | Padrão GitHub | **AUSENTE** | Alto | Alta | Médio |
| **CODE_OF_CONDUCT.md** | Contributor Covenant | **AUSENTE** | Médio | Média | Baixo |
| **Issue Templates** | `.github/ISSUE_TEMPLATE/` | **AUSENTE** | Médio | Média | Baixo |
| **PR Template** | `.github/PULL_REQUEST_TEMPLATE.md` | **AUSENTE** | Médio | Média | Baixo |
| **README** | Técnico-profissional | Manifesto forte, técnico insuficiente | Médio | Alta | Médio |
| **ADR** | Architecture Decision Records | Parcial em `docs/ADR/` | Baixo | Baixa | Baixo |
| **SECURITY.md** | Política de segurança | **AUSENTE** | Médio | Média | Baixo |

---

## 4. ANÁLISE DETALHADA DE GAPS

### 4.1 GAPS CRÍTICOS

#### GAP-1: Arquivos de Governança Open Source AUSENTES

```
FALTANDO NA RAIZ:
├── LICENSE                     # MIT License completo
├── CONTRIBUTING.md             # Guia de contribuição
├── CODE_OF_CONDUCT.md          # Contributor Covenant v2.1
└── SECURITY.md                 # Política de segurança

FALTANDO EM .github/:
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── config.yml
├── PULL_REQUEST_TEMPLATE.md
└── workflows/
    └── ci.yml
```

**Impacto:** Sem credibilidade para colaboradores internacionais.

#### GAP-2: CI/CD AUSENTE

**Faltando automação para:**
- TypeScript type checking (`tsc --noEmit`)
- Linting (Biome)
- Testes unitários (Vitest)
- Testes E2E (Playwright)
- Build verification
- Release automation

**Impacto:** Não há garantias automatizadas de qualidade.

### 4.2 GAPS MÉDIOS

#### GAP-3: Versionamento Inconsistente

| Local | Versão Atual |
|-------|--------------|
| `package.json` | `5.0.1-devmode` |
| `README.md` | `v4.9.1` |
| Footer UI (App.tsx) | `Tesseract v4.9.1 (Nucleus)` |
| Terminal banner | `Build 4.9.1` |
| `ARCHITECTURE.md` | `v5.0.0-toolchain` |
| `CHANGELOG.md` | `v5.0.2-filesystem` |

**Problema:** Fonte de verdade分散 (分散 = descentralizada/fragmentada).

#### GAP-4: Formato de Commits Híbrido

**Atual:** `TSP: [TASK-ID] Descrição imperativa`
**Padrão:** `feat(scope): descrição`

**Análise:**
- Formato atual é funcional e rastreável
- Incompatível com ferramentas automáticas (commitlint, standard-version)
- Recomenda-se hibridismo: `TSP(feat): [A1] descrição`

### 4.3 GAPS BAIXOS

#### GAP-5: README Orientado a Manifesto

**Atual:** Foco em filosofia "Córtex Externo", narrativa de produto
**Ideal:** Documento técnico-profissional de referência

**Faltam seções:**
- Badges (versão, license, build status)
- Estado atual por subsistema
- Stack com versões
- Quick Start
- Scripts operacionais

---

## 5. PLANO DE NORMALIZAÇÃO

### FASE 1 — Fundação Legal (Prioridade: CRÍTICA | Esforço: Baixo)

**Objetivo:** Credibilidade open source mínima para collaborators.

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| A1.1 | `LICENSE` | MIT License texto completo |
| A1.2 | `CONTRIBUTING.md` | Setup, padrões, fluxo de PR,钓鱼 |
| A1.3 | `CODE_OF_CONDUCT.md` | Contributor Covenant v2.1 |
| A1.4 | `.github/SECURITY.md` | Política de disclosure |

### FASE 2 — GitHub Infrastructure (Prioridade: ALTA | Esforço: Médio)

**Objetivo:** Infraestrutura de colaboração.

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| A2.1 | `.github/ISSUE_TEMPLATE/bug_report.md` | Template de bug report |
| A2.2 | `.github/ISSUE_TEMPLATE/feature_request.md` | Template de feature request |
| A2.3 | `.github/PULL_REQUEST_TEMPLATE.md` | Checklist de PR |
| A2.4 | `.github/workflows/ci.yml` | CI: lint, typecheck, test |

### FASE 3 — Consistência de Versão (Prioridade: ALTA | Esforço: Baixo)

**Objetivo:** Fonte de verdade única para versão.

| Ação | Descrição |
|------|-----------|
| A3.1 | `package.json` como fonte de verdade |
| A3.2 | Propagar para `VITE_APP_VERSION`, footer, banner, README |
| A3.3 | Converter para SemVer: `5.0.1-devmode` → `5.1.0-alpha.1` |

### FASE 4 — CI/CD (Prioridade: ALTA | Esforço: Médio)

**Objetivo:** Automação de qualidade.

| Ação | Job | Ferramenta |
|------|-----|------------|
| A4.1 | Lint | Biome |
| A4.2 | Type Check | tsc --noEmit |
| A4.3 | Test | Vitest |
| A4.4 | Build | Vite build |
| A4.5 | E2E | Playwright |

### FASE 5 — README Técnico (Prioridade: ALTA | Esforço: Médio)

**Objetivo:** Documento de referência profissional.

**Seções recomendadas:**
1. Badges (versão, license, build, ci)
2. Descrição técnica
3. Estado atual por subsistema
4. Stack com versões
5. Quick Start
6. Scripts operacionais
7. Arquitetura
8. Contribuição
9. Roadmap

### FASE 6 — Commits Híbridos (Prioridade: MÉDIA | Esforço: Médio)

**Objetivo:** Manter rastreabilidade + compatibilidade.

**Proposta de formato híbrido:**
```
TSP(feat): [A1] Adiciona capacidade X
TSP(fix): [B2] Corrige bug Y
TSP(docs): [C1] Atualiza documentação
```

**Mantém:**
- Prefixo `TSP` (identidade metodológica)
- Referência `[TASK-ID]` (rastreabilidade)
- Adiciona tipo conventional (compatibilidade)

---

## 6. MAPA DE IMPACTO

```
                    ESFORÇO
                    Baixo    Médio    Alto
            ┌────────┬────────┬────────┐
     Alta   │LICENSE │CONTRIB │ CI/CD  │
            │SECURITY│ISSUE   │        │
            │        │TEMPLATE │        │
   PRIORID. ├────────┼────────┼────────┤
   MÉDIA    │README  │COMMIT  │        │
            │VERSION │HYBRID  │        │
            │        │        │        │
   Baixa    │        │        │        │
            └────────┴────────┴────────┘
```

---

## 7. RECOMENDAÇÕES IMPEDIATIVAS

### 7.1 Ações Imediatas (Próxima Sprint)

1. **Criar `LICENSE`** - Credibilidade básica
2. **Criar `.github/SECURITY.md`** - Segurança
3. **Criar GitHub Actions CI** - Qualidade automatizada

### 7.2 Ações Curto Prazo (1-2 Sprints)

1. **Criar `CONTRIBUTING.md`**
2. **Criar Issue Templates**
3. **Normalizar versionamento**
4. **Atualizar README para técnico**

### 7.3 Ações Médio Prazo (3-4 Sprints)

1. **Adotar commits híbridos**
2. **Criar ADR formal**
3. **Branch protection rules**
4. **Release automation**

---

## 8. ANEXO: MAPA DE ARQUIVOS METODOLÓGICOS ATUAIS

| Arquivo | Local | Conteúdo |
|---------|-------|----------|
| INCEPTION_METHODOLOGY.md | `_claude/inception-methodology/` | Metodologia raiz completa |
| RABELUS_LAB_GOVERNANCE_CANON.md | `docs/rabelus-lab-methodology/` | Governança Tessy |
| TESSY_DEV_PROTOCOL.md | `.agent/` | Padrões de engenharia |
| MISSION_PROTOCOL.md | `.agent/` | Barramento de missões |
| CHANGELOG.md | Raiz | Histórico de releases |
| ARCHITECTURE.md | Raiz | Toolchain e stack |

---

> "A padronização não é imposição — é convidar o mundo a participar da sua visão com um vocabulário comum."

*Documento preparado para o projeto Tessy (Rabelus Lab) - 2026-03-13*