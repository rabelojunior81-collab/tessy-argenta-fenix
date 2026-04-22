# REPORT TEMPLATE
## Missao: tdp-viewer-persistence-broker-terminal-2026-03

**Status atual:** `EM_EXECUCAO`  
**Executor:** `Codex GPT-5`  
**Data de inicio:** `2026-03-08`  
**Data de conclusao:** ``

---

## 1. PRE-FLIGHT CHECK

- [x] Li `.agent/MISSION_PROTOCOL.md`
- [x] Li `.agent/TESSY_DEV_PROTOCOL.md`
- [x] Li o briefing e o manifest desta missao
- [x] Verifiquei o estado atual do terminal/viewers no codebase
- [x] Registrei as decisoes aprovadas pelo operador

Notas:
- `FileExplorer` remounta porque o painel lateral desmonta via `AnimatePresence` + roteamento destrutivo
- `nul` não é manipulável com segurança nesta etapa e permanece classificado

---

## 2. LOG DE EXECUCAO

### TASK-A1 - Arquivar missão anterior
- Status: `CONCLUIDO`
- Acoes: `tdp-platform-hardening-voice-2026-03` movida para `missions/journal/`
- Resultado: barramento voltou a ter apenas uma missão ativa

### TASK-A2 - Abrir missão estrutural nova
- Status: `CONCLUIDO`
- Acoes: criados briefing, manifest, report e communication protocol
- Resultado: missão `tdp-viewer-persistence-broker-terminal-2026-03` aberta formalmente

### TASK-A3 - Arquivar `.claude/`
- Status: `CONCLUIDO`
- Acoes: conteúdo arquivado em `docs/legacy-data/claude/`
- Resultado: ruído legado preservado fora do core operacional

### TASK-B1/B2 - Host persistente dos viewers
- Status: `CONCLUIDO`
- Acoes: `MainLayout`, `ViewerPanel` e `useViewerRouter` reestruturados para manter os viewers montados e alternar apenas visibilidade
- Resultado: painel lateral deixa de desmontar viewers a cada troca/colapso

### TASK-C1/C2/C3 - Modelo canônico de broker
- Status: `CONCLUIDO`
- Acoes: `Workspace` ampliada com metadata de broker, banco atualizado para v6 e client do broker criado no frontend
- Resultado: o app passa a rastrear registro/validação de workspace real

### TASK-D1/D2/D3 - Broker runtime
- Status: `CONCLUIDO`
- Acoes: backend local evoluído para broker-aware terminal server com registry persistente em `~/.tessy/broker/workspaces.json`
- Resultado: sessão PTY passa a nascer com `cwd` vinculado ao `workspaceId`

### TASK-E1/E2/E3 - UX do terminal
- Status: `CONCLUIDO`
- Acoes: `RealTerminal` integrado ao broker com overlay para registro/revalidação e gating por status real
- Resultado: terminal só conecta quando a workspace do projeto estiver validada no broker

---

## 3. VALIDACAO FINAL

- [x] `npx tsc --noEmit`
- [x] Viewer persistence validada
- [x] Broker terminal validado
- [x] Docs/changelog atualizados
- [x] Riscos residuais declarados
