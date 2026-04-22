# TASK MANIFEST
## Missao: tdp-viewer-persistence-broker-terminal-2026-03

### Grupo A — Barramento e Legado
- `TASK-A1`: arquivar missão anterior no journal
- `TASK-A2`: abrir missão estrutural nova
- `TASK-A3`: arquivar `.claude/` em legado documental

### Grupo B — Viewer Persistence
- `TASK-B1`: substituir desmontagem destrutiva por host persistente
- `TASK-B2`: manter viewers montados e alternar apenas visibilidade
- `TASK-B3`: validar preservação de estado no FileExplorer

### Grupo C — Broker Model
- `TASK-C1`: ampliar schema `Workspace` com metadata de broker
- `TASK-C2`: criar client/frontend para broker local
- `TASK-C3`: atualizar serviços/contextos de workspace com registro e validação

### Grupo D — Broker Runtime
- `TASK-D1`: evoluir backend local para broker-aware terminal server
- `TASK-D2`: registrar workspace real por path absoluto
- `TASK-D3`: criar sessão PTY com `cwd` correto por `workspaceId`

### Grupo E — Terminal UX
- `TASK-E1`: conectar RealTerminal ao broker
- `TASK-E2`: overlay acionável para registrar/revalidar workspace
- `TASK-E3`: fallback legacy controlado e mensagens de estado

### Grupo Z — Fechamento
- `TASK-Z1`: atualizar docs e changelog
- `TASK-Z2`: auditoria final de sanitização
- `TASK-Z3`: validação, commit e push
