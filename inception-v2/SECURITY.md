# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@rabeluslab.dev**

We aim to respond within 48 hours and will keep you updated on our progress.

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Possible impact
- Suggested fix (if any)
- Your contact information for follow-up

### Response Process

1. **Acknowledgment**: We will acknowledge receipt within 48 hours
2. **Investigation**: We will investigate and validate the report
3. **Fix Development**: We will develop and test a fix
4. **Disclosure**: We will coordinate disclosure with you
5. **Release**: We will release the fix and credit you (if desired)

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **Secure Configuration**:
   - Use strong API keys
   - Enable authentication
   - Configure allowlists
   - Set appropriate autonomy levels

3. **Environment Variables**:

   ```bash
   # Never commit these
   INCEPTION_API_KEY=sk-...
   INCEPTION_TELEGRAM_BOT_TOKEN=...
   INCEPTION_DISCORD_BOT_TOKEN=...
   ```

4. **Network Security**:
   - Bind to localhost in production
   - Use tunnels (Cloudflare, Tailscale) for remote access
   - Enable HTTPS

5. **File System**:
   - Configure workspace boundaries
   - Block sensitive paths
   - Use Docker sandbox for untrusted code

### For Contributors

1. **Input Validation**: Always validate and sanitize inputs
2. **Path Traversal**: Prevent `..` sequences and symlink attacks
3. **Injection Prevention**: Use parameterized queries
4. **Secrets**: Never hardcode secrets; use environment variables
5. **Dependencies**: Keep dependencies updated; audit with `pnpm audit`

## Runtime Security Implementation

### SecurityManager (`packages/security/src/security-manager.ts`)

The `SecurityManager` class is the central security enforcement point, fully implemented and applied to every tool execution:

| Protection                 | What it does                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **SSRF prevention**        | Blocks requests to private IP ranges (10.x, 172.16-31.x, 192.168.x, localhost variants) |
| **Path traversal**         | Rejects `..` sequences, null bytes, and symlink escapes outside `workspacePath`         |
| **Command injection**      | Validates shell commands against an explicit `allowedCommands` allowlist                |
| **Pairing authentication** | Generates and validates one-time pairing codes for remote channels (HTTP, Telegram)     |
| **URL allowlist**          | HTTP tools check URLs against `allowedUrls` config before any request                   |

### Approval Gates (`packages/agent/src/agent-loop.ts`)

The `AgentLoop` enforces an `ApprovalGate` before executing any tool call when `autonomyLevel` is `Supervised`:

- `AutonomyLevel.Supervised` (default) — user must approve destructive actions
- `AutonomyLevel.Full` — no gates, autonomous execution
- `AutonomyLevel.Readonly` — no writes, no shell, read-only mode

### Known Gap: Rate Limiting (G2)

> **⚠️ Gap G2 (MEDIUM):** Rate limiting is configured in `.inception.json` (`security.rateLimit`) but `SecurityManager.checkRateLimit()` is not yet implemented. The AgentLoop does not call it before `generate()`. Scheduled for Sprint 2, ss-2.3.

## Security Features

### Built-in Protections

- **Sandbox Mode**: Docker containerization for tool execution
- **Allowlists**: Command and path restrictions
- **Rate Limiting**: Configured but not yet enforced (Gap G2 — Sprint 2)
- **Authentication**: Bearer token and pairing code support
- **Autonomy Levels**: readonly/supervised/full control
- **Gate System**: Mandatory checks for sensitive operations

### Security Checklist

- [ ] Gateway bound to localhost
- [ ] Pairing authentication enabled
- [ ] Workspace path configured
- [ ] Sensitive paths blocked
- [ ] Command allowlist defined
- [ ] Rate limits configured
- [ ] HTTPS/TLS enabled
- [ ] Logging enabled
- [ ] Docker sandbox for tools

## Vulnerability Disclosure Policy

We follow responsible disclosure:

1. Reporter submits vulnerability privately
2. We acknowledge and investigate (within 48h)
3. We develop and test fix
4. We release fix and publish security advisory
5. We credit reporter (with permission)

## Credits

We thank the following security researchers:

_To be populated as reports are received_

---

_Last updated: 2026-03-12_
