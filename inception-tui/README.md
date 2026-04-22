# Inception Methodology TUI
> by Rabelus Lab

Onboarding interativo via terminal para a [Inception Methodology](../inception-methodology/INCEPTION_METHODOLOGY.md).

## Instalação

```bash
# Desenvolvimento (via tsx)
cd inception-tui
npm install
npm run dev:init
```

```bash
# Produção (build + run)
npm run build
node dist/cli.js init
```

## Comandos

```bash
# Onboarding interativo — novo projeto
inception init

# Onboarding em diretório específico
inception init --dir ./meu-projeto

# Diagnóstico de saúde
inception check

# Criar nova missão
inception mission new

# Listar missões ativas + journal
inception mission list

# Arquivar missão concluída (→ journal imutável)
inception mission archive <sprint-id>
```

## O que é gerado pelo `inception init`

```
.agent/
├── inception-config.json          ← Configuração (versionável)
├── AGENT_IDENTITY.md              ← Identidade do agente
├── MISSION_PROTOCOL.md            ← IMP personalizado
├── ENGINEERING_PROTOCOL.md        ← IEP com gates selecionados
├── SAFETY_WORKFLOW.md             ← ISP com autonomia configurada
├── skills/README.md               ← Registry de skills
└── missions/
    ├── journal/.gitkeep
    └── _template/
        ├── MISSION_BRIEFING.md
        ├── TASK_MANIFEST.md
        ├── COMMUNICATION_PROTOCOL.md
        └── REPORT_TEMPLATE.md
```

## Stack

- **Runtime:** Node.js ≥ 18
- **Prompts:** [@clack/prompts](https://github.com/natemoo-re/clack)
- **Colors:** [chalk](https://github.com/chalk/chalk) v5
- **ASCII Art:** [figlet](https://github.com/patorjk/figlet.js) (ANSI Shadow font)
- **CLI Framework:** [commander](https://github.com/tj/commander.js)

---

**Inception Methodology v1.0.0 · by Rabelus Lab**
