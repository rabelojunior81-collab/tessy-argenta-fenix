# MISSION BRIEFING
## Missão: CoPilot Thoughts & Live API v1
**Missão ID:** `copilot-thoughts-live-v1-2026-03`
**Status:** `AGUARDANDO_EXECUCAO`

---

## 1. CONTEXTO

Épico 4D — Geração de imagem + thinking + Live API.

**Dependência:** copilot-ux-v1

**Pesquisa já realizada (ver HANDOFF.md):**
- Gemini 2.5 Flash Image: `gemini-2.5-flash-image`
- Thinking: `thinkingLevel` (Gemini 3.x) ou `thinkingBudget` (2.5)
- Live API: `gemini-live-2.5-flash-native-audio`

**SDK atual:** `@google/genai 1.44.0` → atualizar para 1.45.0

---

## 2. TAREFAS

- Atualizar @google/genai para 1.45.0
- Implementar geração de imagem (gemini-2.5-flash-image)
- Implementar thinking/thinkingLevel
- Implementar Live API (opcional v1)
- Remover typewriter effect
- Criar Studio Modal (opicional)

---

## 3. CRITÉRIO

- [ ] SDK atualizado
- [ ] Geração de imagem funcionando
- [ ] Thinking configurável
- [ ] npx tsc --noEmit passa
- [ ] CHANGELOG.md atualizado

---

*Documento parte do barramento de missão `copilot-thoughts-live-v1-2026-03`*