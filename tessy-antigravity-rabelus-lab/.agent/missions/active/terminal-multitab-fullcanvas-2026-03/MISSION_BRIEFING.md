# MISSION BRIEFING
## Missão: Terminal Multi-Tab Full Canvas
**Missão ID:** `terminal-multitab-fullcanvas-2026-03`
**Status:** `AGUARDANDO_EXECUCAO`

---

## 1. CONTEXTO

Épico 5 — Terminal ocupa canvas completo + múltiplas abas.

**Problemas identificados (ver HANDOFF.md):**
- RealTerminal.tsx:84 — max 600px → altura total
- Multi-tab não implementado
- Broker não suporta multi-tab

**Infraestrutura disponível:**
- Broker já funcional
- WebSocket terminal funcionando

---

## 2. TAREFAS

- Remover limite de 600px (full canvas)
- Implementar multi-tab: Map<tabId, Terminal>
- Broker suportar {clientId}-{tabId} → PTY
- Posicionamento flexível (inferior/lateral/flutuante)

---

## 3. CRITÉRIO

- [ ] Terminal ocupa canvas completo
- [ ] Múltiplas abas funcionam
- [ ] Broker suporta múltiplas sessões
- [ ] Posicionamento flexível
- [ ] npx tsc --noEmit passa

---

## 4. DEPENDÊNCIAS

Nenhuma — pode executar em paralelo com qualquer missão

---

*Documento parte do barramento de missão `terminal-multitab-fullcanvas-2026-03`*