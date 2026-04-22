# Features: inception-tui

**Project:** inception-tui - Methodology Bootstrap Tool
**Researched:** 2026-04-20
**Confidence:** MEDIUM

---

## Feature Landscape

### Table Stakes

| Feature | Complexity | Dependencies | Notes |
|---------|------------|--------------|-------|
| **CLI Commands** | Low | Commander | init, check, mission |
| **Onboarding Flows** | Medium | @clack/prompts | Interactive user guidance |
| **Project Generators** | Medium | fs-extra, template-file | Scaffold .agent/ structures |

### Differentiators

| Feature | Complexity | Notes |
|---------|------------|-------|
| **Methodology Canon** | Medium | Integration with _claude/inception-methodology |
| **Mission Templates** | Low | Reusable mission structures |

### Anti-Features

| Feature | Reason |
|---------|--------|
| **GUI / Web Interface** | TUI-first. Simplicity is the point. |
| **Runtime Execution** | Only scaffolding, not execution |
| **Agent Loop** | Belongs to inception-v2, not inception-tui |

---

## Dependency Map

```
cli.ts
  → commands/
  │   ├── init.ts
  │   ├── check.ts
  │   └── mission.ts
  → onboarding/
  │   └── flows.ts
  → generators/
  │   └── agent.ts (generates .agent/ structure)
  → templates/
  │   └── (markdown/template files)
  → _claude/inception-methodology/
      └── (canon files)
```

---

## Sources

- [TUI Design Principles](https://en.wikipedia.org/wiki/Text-based_user_interface) - Reference
- [CLI Design Patterns](https://cli.developer銅.cloud/) - Reference