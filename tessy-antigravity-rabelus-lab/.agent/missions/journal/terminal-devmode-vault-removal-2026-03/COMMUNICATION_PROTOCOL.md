# COMMUNICATION PROTOCOL
## Missao: terminal-devmode-vault-removal-2026-03

---

## Contrato de Execução

### Regras obrigatórias

1. Skill Discovery antes de qualquer ação (Read/Edit/Write/Glob/Grep + Bash + TodoWrite)
2. Pre-Flight: `git status` limpo + branch `main` confirmado
3. Branch criada antes do primeiro commit: `feature/terminal-devmode-vault-removal`
4. Cada task tem seu próprio commit atômico no formato `TSP: [TASK-ID] descrição`
5. REPORT_TEMPLATE preenchido em tempo real
6. Push apenas com aprovação explícita do operador (Adilson)

### Arquivos proibidos nesta missão

- `contexts/WorkspaceContext.tsx` — NÃO TOCAR
- `services/fsaAdapter.ts` — NÃO TOCAR
- `services/fileSystemService.ts` — NÃO TOCAR
- `services/cryptoService.ts` — NÃO DELETAR, apenas desacoplar

### Sinalização de bloqueio

Se uma task bloquear:
1. Commit imediato do estado atual: `TSP: [TASK-ID] BLOQUEADO — <motivo>`
2. Registrar no REPORT_TEMPLATE, seção "Log de Bloqueios"
3. Avançar para próxima task se possível
4. Reportar ao operador antes de prosseguir no item bloqueado

### Protocolo de entrega

Checklist final antes de reportar conclusão ao operador:
- [ ] `git status` — apenas arquivos da missão modificados
- [ ] `npx tsc --noEmit` — zero erros (G1)
- [ ] `npm run e2e` — smoke passa (G4)
- [ ] CHANGELOG atualizado
- [ ] REPORT_TEMPLATE preenchido
- [ ] Branch não mergeada — aguardando aprovação

---

## Critério de aceite pelo operador

- Terminal abre shell em `process.cwd()` sem configuração adicional
- AuthPanel salva/recupera token sem campos de vault
- Zero regressão em funcionalidades não relacionadas
