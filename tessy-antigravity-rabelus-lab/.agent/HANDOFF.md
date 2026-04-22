# HANDOFF — Plano Mestre Frontend Tessy
## Data: 2026-03-18 | Para: próxima instância (qualquer LLM)

---

## O QUE JÁ FOI FEITO NESTA SESSÃO

### Missões Criadas (2026-03-18) — TODAS COM 4 DOCUMENTOS

| # | Missão ID | Status | Documentos |
|---|-----------|--------|------------|
| 1 | `tdd-first-suite-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 2 | `version-display-fix-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 3 | `project-cards-reactivity-fix-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 4 | `github-source-control-v1-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 5 | `copilot-ux-v1-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 6 | `copilot-images-v1-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 7 | `copilot-thoughts-live-v1-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |
| 8 | `terminal-multitab-fullcanvas-2026-03` | AGUARDANDO_EXECUCAO | 4 ✅ |

### Missões Arquivadas
- `repo-sanitization-governance-2026-03` → journal/
- `ptbr-documentation-enforcement-2026-03` → journal/

---

## ROADMAP COMPLETO — 8 MISSÕES ATIVAS

### FASE 1 — FUNDACIONAL (Paralelo: Agentes A, B, C)
```
tdd-first-suite-2026-03           ← testes unitários
version-display-fix-2026-03       ← versão dinâmica
project-cards-reactivity-fix-2026-03 ← reatividade
```

### FASE 2 — CO-PILOT UX (Agente D)
```
copilot-ux-v1-2026-03              ← input + anexos
```

### FASE 3 — CO-PILOT AVANÇADO (Agentes E, F)
```
copilot-images-v1-2026-03          ← imagens inline (depende de 5)
copilot-thoughts-live-v1-2026-03    ← geração + thinking + Live API (depende de 5)
```

### FASE 4 — GIT (Agente G)
```
github-source-control-v1-2026-03    ← branches, commits, push/pull
```

### FASE 5 — TERMINAL (Agente H)
```
terminal-multitab-fullcanvas-2026-03 ← full canvas + multi-tab
```

---

## DEPENDÊNCIAS EXPLÍCITAS

| Missão | Depende de | Pode paralelizar com |
|--------|------------|---------------------|
| tdd-first-suite | nenhuma | version, project-cards, terminal |
| version-display-fix | nenhuma | tdd, project-cards, terminal |
| project-cards-reactivity-fix | nenhuma | tdd, version, terminal |
| github-source-control-v1 | tdd (opcional) | — |
| copilot-ux-v1 | version + project-cards | — |
| copilot-images-v1 | copilot-ux | — |
| copilot-thoughts-live-v1 | copilot-ux | — |
| terminal-multitab-fullcanvas | nenhuma | tdd, version, project-cards |

---

## MAPA DE ÉPICOS

| Épico | Missão | Status |
|-------|--------|--------|
| Épico 1 — Versão dinâmica | version-display-fix | ✅ PRONTO |
| Épico 2 — Reatividade | project-cards-reactivity | ✅ PRONTO |
| Épico 3 — GitHub Control | github-source-control-v1 | ✅ PRONTO |
| Épico 4A/4B — CoPilot UX | copilot-ux-v1 | ✅ PRONTO |
| Épico 4C — Imagens | copilot-images-v1 | ✅ PRONTO |
| Épico 4D — Thoughts/Live | copilot-thoughts-live-v1 | ✅ PRONTO |
| Épico 5 — Terminal | terminal-multitab-fullcanvas | ✅ PRONTO |
| Infra — Testes | tdd-first-suite | ✅ PRONTO |

---

## ARQUIVOS CRÍTICOS

| Arquivo | Status |
|---------|--------|
| `.agent/HANDOFF.md` | ✅ Atualizado |
| `.agent/protocols/TMP.md` | ✅ OK |
| `.agent/protocols/TDP.md` | ✅ OK |
| `.agent/missions/active/` | ✅ 8 missões |

---

## COMO USAR ESTE ROADMAP

### Para executar UMA missão:
1. Ler `.agent/HANDOFF.md`
2. Escolher missão com status AGUARDANDO_EXECUCAO
3. Ler os 4 documentos em `.agent/missions/active/<missão>/`
4. Executar seguindo TMP/TDP/TSP

### Para executar em PARALELO:
```
Agente A → tdd-first-suite
Agente B → version-display-fix
Agente C → project-cards-reactivity-fix
```
(**NINGUÉM depende um do outro**)

### Para AUDITORIA:
- Ler `.agent/protocols/TMP.md`
- Consultar `.agent/missions/active/` para missões
- Consultar CHANGELOG.md para histórico

---

## PESQUISA GEMINI (MARÇO 2026)

Ver detalhes em `.agent/HANDOFF.md` (seção "PESQUISA GEMINI API").

| Modelo | ID | Uso |
|--------|-----|-----|
| Imagem | `gemini-2.5-flash-image` | 1290 tokens/imagem |
| Live API | `gemini-live-2.5-flash-native-audio` | Áudio nativo |
| Thinking | `thinkingLevel` (3.x) ou `thinkingBudget` (2.5) | Reasoning |

SDK: `@google/genai 1.45.0` disponível

---

*Atualizado em 2026-03-18*
*8 missões criadas, todas com 4 documentos*