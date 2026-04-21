# Inception Methodology — Índice
## by Rabelus Lab

**Versão:** 1.0.0
**Data:** 2026-03-10
**Origem:** Extraída do projeto Tessy (Rabelus Lab)

---

## Artefatos

| Arquivo | Descrição | Audiência |
|---------|-----------|-----------|
| [INCEPTION_METHODOLOGY.md](./INCEPTION_METHODOLOGY.md) | A Metodologia completa — filosofia, princípios, protocolos, ciclos, onboarding | Qualquer agente (humano ou IA) |
| [inception-schema.json](./inception-schema.json) | JSON Schema completo do arquivo inception-config.json | Implementadores do TUI |
| [onboarding-tui-spec.md](./onboarding-tui-spec.md) | Especificação técnica do pacote TUI interativo | Desenvolvedores |

---

## Estrutura da Metodologia

```
Inception Methodology
├── Filosofia (4 axiomas)
├── Três Pilares
│   ├── IEP — Inception Engineering Protocol
│   ├── ISP — Inception Safety Protocol
│   └── IMP — Inception Mission Protocol
├── Identidade do Agente
├── Arquitetura de Missões
│   ├── 4 Documentos por Missão
│   ├── 4 Modos de Agente (A/B/C/D)
│   └── Journal Imutável
├── Contratos de Feature
├── Gates de Qualidade (6 padrão + customizáveis)
├── Ciclo de Operação (Intenção → Missão → Execução → Retro)
├── Loops de Evolução (Micro / Meso / Macro)
├── Princípios Implícitos (8 emergentes da prática)
└── Onboarding TUI (spec)
```

---

## Origem

A Inception Methodology foi extraída da experiência viva do projeto **Tessy v5.0.2-filesystem** (Rabelus Lab, 2026).

Nenhum princípio foi postulado a priori. Todos emergiram de decisões reais, erros corrigidos e padrões que se provaram estáveis ao longo de 11+ missões de desenvolvimento.

**Documentos raiz (no projeto Tessy):**
- `.agent/TESSY_DEV_PROTOCOL.md` — origem do IEP
- `.agent/MISSION_PROTOCOL.md` — origem do IMP
- `.agent/workflows/safe-development.md` — origem do ISP
- `docs/rabelus-lab-methodology/RABELUS_LAB_GOVERNANCE_CANON.md` — governance original
