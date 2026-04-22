# VERSIONING.md — Política de Versionamento Tessy
> Parte dos protocolos obrigatórios. `.agent/protocols/VERSIONING.md`

---

## FORMATO DE VERSÃO

```
vMAJOR.MINOR.PATCH-codename
```

Exemplos: `v5.0.3-toolcalling-lint-pass`, `v5.1.0-terminal-broker`, `v6.0.0-rewrite-cortex`

---

## QUANDO BUMPAR CADA NÍVEL

### PATCH — Bug fixes, manutenção, sanitização
- Correção de bugs sem mudança de comportamento
- Fix de lint / tsc
- Reorganização de documentação / governança (esta missão)
- Ajustes de configuração sem impacto funcional
- Hotfixes de produção

### MINOR — Funcionalidade nova ou integração completa
- Nova feature visível ao usuário
- Integração completa de subsistema (ex: filesystem, autodoc, firecrawl)
- Novo modal, nova aba, novo modo
- Adição de provider de LLM
- Subsistema de testes estabelecido e funcional

### MAJOR — Quebra arquitetural ou reescrita
- Mudança incompatível de API ou contrato de dados
- Reescrita de módulo central (ex: Gemini service, WorkspaceContext)
- Mudança de framework ou stack
- Migração de banco de dados incompatível com versão anterior

---

## CONVENÇÃO DE CODENAME

O codename descreve a **principal conquista** da versão. Formato: `kebab-case`, máximo 4 palavras.

Exemplos:
- `toolcalling-lint-pass` — fix de tool calling + zero lint
- `filesystem-omniscience` — integração filesystem completa
- `terminal-broker` — terminal node-pty funcionando
- `tdd-first-suite` — primeiros testes de negócio

---

## AS 4 FONTES DE VERSÃO (Gate G5)

Toda release deve atualizar **simultaneamente** estas 4 fontes:

| Fonte | Localização | Formato |
|-------|-------------|---------|
| `package.json` | raiz | `"version": "X.Y.Z"` |
| `VERSION.md` | raiz | `## Versão Atual: vX.Y.Z-codename` |
| `App.tsx` | footer ~linha 253 | `Tesseract vX.Y.Z (Codename)` |
| `CHANGELOG.md` | raiz | `## [vX.Y.Z-codename] - YYYY-MM-DD` |

**Nunca atualize uma fonte sem as outras.** Use sempre o script `release.mjs`.

---

## PROCESSO DE RELEASE — PASSO A PASSO

### Opção A — Automatizada (recomendada)

```bash
# 1. Verificar estado limpo
git status

# 2. Executar release
node scripts/release.mjs patch <codename>
# ou: minor, major

# 3. Validar
npm run validate-version

# 4. Verificar visualmente o App.tsx footer
grep "Tesseract v" src/App.tsx
```

O script faz automaticamente:
1. Lê versão atual de `package.json`
2. Calcula nova versão (semver)
3. Atualiza `package.json`
4. Atualiza `VERSION.md`
5. Atualiza banner no `App.tsx` footer
6. Move `[Unreleased]` → `[vX.Y.Z-codename] - YYYY-MM-DD` em `CHANGELOG.md`
7. Commit atômico: `TSP: [RELEASE] bump vX.Y.Z-codename`
8. Cria git tag `vX.Y.Z`

### Opção B — Manual (apenas emergências)

1. Edite `package.json` → campo `version`
2. Edite `VERSION.md` → linha da versão atual
3. Edite `App.tsx` → linha do footer (grep por `Tesseract v`)
4. Edite `CHANGELOG.md` → renomeie `[Unreleased]` para `[vX.Y.Z-codename] - YYYY-MM-DD`
5. `npm run validate-version` → deve retornar exit 0
6. Commit: `TSP: [RELEASE] bump vX.Y.Z-codename`
7. `git tag vX.Y.Z`

---

## VALIDAÇÃO OBRIGATÓRIA

Antes de qualquer PR que contenha versão:

```bash
npm run validate-version   # deve retornar exit 0
npx tsc --noEmit           # deve retornar sem output
npx biome check src/       # deve retornar 0 erros
```

---

## HISTÓRICO DE VERSÕES (referência)

| Versão | Codename | Data | Destaque |
|--------|----------|------|----------|
| v5.0.3 | toolcalling-lint-pass | 2026-03-18 | Fix tool calling Gemini + zero lint + repo sanitization |
| v5.0.2 | filesystem | 2026-03-10 | Filesystem omniscience completa |
| v5.0.1 | nucleus | 2026-03-07 | Estabilização pós-auditoria |
| v4.9.x | — | anterior | Versões pré-refatoração |

---

*Protocolo mantido por TDP Gate G5. Atualize este histórico a cada release.*
