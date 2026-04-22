# TASK MANIFEST
## Missao: filesystem-fix-omniscience-2026-03

### Grupo A — Polyfill Buffer
- `TASK-A1`: instalar pacote `buffer` como dependência de produção
- `TASK-A2`: configurar `vite.config.ts` com `define: { global: 'globalThis' }` e `resolve.alias: { buffer: 'buffer/' }`
- `TASK-A3`: Gate G1 — `npx tsc --noEmit` deve passar

### Grupo B — Validação AI
- `TASK-B1`: mapear o que `workspaceAIService.ts` expõe para o CoPilot
- `TASK-B2`: identificar gaps na onisciência (o que falta para a IA acessar os arquivos)
- `TASK-B3`: (próxima missão se necessário) implementar file context para AI

### Grupo Z — Fechamento
- `TASK-Z1`: commit TSP atômico na feature branch
- `TASK-Z2`: apresentar ao operador para aprovação (merge manual)
- `TASK-Z3`: arquivar missão após merge
