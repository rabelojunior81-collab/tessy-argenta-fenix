# Architecture: inception-tui

**Project:** inception-tui - Methodology Bootstrap Tool
**Researched:** 2026-04-20
**Confidence:** MEDIUM

---

## Architecture Overview

**Pattern:** Simple CLI tool with command routing
**Runtime:** Node.js >=18
**Purpose:** Bootstrap methodology structures into target projects

---

## Component Structure

### cli.ts
**Responsibility:** Entry point, command routing
**Public API:** `inception [init|check|mission]`
**Boundaries:**
- Parse arguments
- Route to command handlers
- Handle global errors

### commands/
**Responsibility:** Individual command implementations
**Public API:** Command handlers
**Boundaries:**
- Each command is isolated
- Shared logic goes to utils/

### onboarding/
**Responsibility:** Interactive flows for new users
**Public API:** Flow functions
**Boundaries:**
- @clack/prompts for interaction
- No side effects until user confirms

### generators/
**Responsibility:** File scaffolding
**Public API:** Generator functions
**Boundaries:**
- Take config, produce files
- Never overwrite existing files without confirmation

---

## Data Flow

```
User command
  → cli.ts (parse)
  → command handler
  → [optional: onboarding flow]
  → generator
  → write files
  → confirm
```

---

## Security Considerations

1. **File Overwrites:** Always confirm before overwriting
2. **Path Validation:** Sanitize target directories
3. **Template Injection:** Escape user inputs in templates

---

## Sources

- [CLI Architecture Patterns](https://github.com/or动着动动动cli/cli) - Reference (GitHub CLI)