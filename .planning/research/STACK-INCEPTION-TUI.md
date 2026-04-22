# Technology Stack: inception-tui

**Project:** inception-tui - Methodology Bootstrap Tool
**Researched:** 2026-04-20
**Confidence:** MEDIUM-HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Node.js** | `>=18.0.0` | Runtime | Project requirement. LTS stable. |
| **TypeScript** | `^5.9.3` | Type safety | Project standard. |

### CLI Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Commander** | `^12.0.0` | CLI structure | Standard Node CLI framework. Parses commands/args. |
| **@clack/prompts** | `^0.7.0` | Interactive UI | Beautiful spinners, text inputs, confirmations. |

### File Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **fs-extra** | `^11.0.0` | File operations | Promise-based fs with extra utilities. |
| **template-file** | `^3.1.0` | Template rendering | Simple template interpolation. |

### Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **zod** | `^3.22.4` | Schema validation | Runtime validation for generated configs. |
| **validate-npm-package-name** | `^4.0.0` | Package name validation | Ensure generated packages have valid names. |

---

## Package Structure

```
inception-tui/
├── src/
│   ├── cli.ts              # Entry point
│   ├── onboarding/         # Onboarding flows
│   ├── commands/           # Mission, init, check commands
│   ├── generators/         # Project scaffolding
│   └── templates/          # Template files
└── _claude/inception-methodology/  # Methodology canon
```

---

## Module Dependencies

```
cli.ts
  → commands/
  → onboarding/
  → generators/
  → templates/
  → _claude/inception-methodology/
```

---

## What NOT to Use

### Avoid: Inquirer.js
**Reason:** @clack/prompts provides better UX with same functionality. Inquirer is older and less maintained.

**Instead:** Use @clack/prompts

### Avoid: Yeoman
**Reason:** Too opinionated, complex scaffolding. inception-tui needs simple template generation.

**Instead:** Keep custom generators with template-file

---

## Version Verification Summary

| Library | Project Version | Recommended | Notes |
|---------|----------------|-------------|-------|
| Node.js | >=18 | >=18.0.0 | LTS |
| Commander | 12.0.0 | ^12.0.0 | Latest |
| @clack/prompts | 0.7.0 | ^0.7.0 | Latest |

---

## Sources

- [Commander Documentation](https://github.com/tj/commander.js) - **HIGH** (official)
- [Clack Prompts](https://github.com/natemoo-re/clack) - **HIGH** (official)
- [Node.js LTS Schedule](https://nodejs.org/en/about/previous-releases) - **HIGH** (official)