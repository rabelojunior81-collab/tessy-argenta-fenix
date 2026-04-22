# Pitfalls: inception-tui

**Project:** inception-tui - Methodology Bootstrap Tool
**Researched:** 2026-04-20
**Confidence:** MEDIUM

---

## Critical Pitfalls

### 1. Template Injection
**Severity:** HIGH
**Warning Signs:**
- User input appearing verbatim in generated files
- Special characters breaking templates

**Prevention:**
- Escape all user inputs before template interpolation
- Use template-file with safe interpolation

**Phase:** Generators

### 2. Overwriting Existing Files
**Severity:** HIGH
**Warning Signs:**
- Users losing custom configurations
- Generator corrupting existing setups

**Prevention:**
- Always check if file exists
- Require explicit confirmation for overwrites
- Backup before overwrite

**Phase:** Generators

### 3. Broken Template Paths
**Severity:** MEDIUM
**Warning Signs:**
- "Template not found" errors
- Inconsistent file generation

**Prevention:**
- Use path resolution relative to project root
- Validate template existence before use

**Phase:** Generators

---

## Common Mistakes

### 4. Not Validating Target Directory
**Severity:** MEDIUM
**Problem:** Running in wrong directory or non-project directory

**Prevention:**
- Check for package.json or git in target
- Warn user if not a known project type

### 5. Silent Failures
**Severity:** MEDIUM
**Problem:** Generator fails but doesn't tell user

**Prevention:**
- Always exit with non-zero code on failure
- Print clear error messages
- Suggest fixes

---

## Phase Mapping

| Pitfall | Phase | Severity |
|---------|-------|----------|
| Template injection | Generators | HIGH |
| File overwrites | Generators | HIGH |
| Broken paths | Generators | MEDIUM |
| Invalid target | Init command | MEDIUM |
| Silent failures | All | MEDIUM |

---

## Sources

- [Template Injection OWASP](https://owasp.org/www-project-web-security-testing-guide/) - Reference
- [Node.js File System Best Practices](https://nodejs.org/api/fs.html) - Reference