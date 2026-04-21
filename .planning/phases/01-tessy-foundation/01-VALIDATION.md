---
phase: 01
slug: tessy-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 01 - Validation Strategy

> Contrato de validacao da fundacao do Tessy antes da execucao da fase.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + playwright |
| **Config file** | `tessy-antigravity-rabelus-lab/vite.config.ts` + `tessy-antigravity-rabelus-lab/playwright.config.ts` |
| **Quick run command** | `npm run typecheck` |
| **Full suite command** | `npm run test && npm run e2e -- --grep "smoke|foundation"` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck`
- **After every plan wave:** Run `npm run test && npm run e2e -- --grep "smoke|foundation"`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | TESSY-04 | T-01-01-A | Apenas viewers permitidos viram rota; caminhos invalidos degradam para shell neutro | unit | `npx vitest run src/test/foundation/viewerRouting.test.tsx` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | TESSY-01 | T-01-02-A | Autosave fica editavel no header sem quebrar save manual | integration | `npx vitest run src/test/foundation/editorHeader.test.tsx` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | TESSY-05 | T-01-02-B | Arquivo grande exige decisao explicita antes de abrir | unit | `npx vitest run src/test/foundation/fileOpenPolicy.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | TESSY-05 | T-01-03-A | Monaco usa workers locais e modo seguro previsivel | unit | `npx vitest run src/test/foundation/monacoSetup.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 1 | TESSY-02 | T-01-04-A | Sessao PTY continua manual, com estados corretos de offline/connecting/connected/error | integration | `npx vitest run src/test/foundation/realTerminal.test.tsx` | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 | 2 | TESSY-03 | T-01-05-A | Scrollback configuravel respeita limite e fallback padrao | unit | `npx vitest run src/test/foundation/terminalPreferences.test.ts` | ❌ W0 | ⬜ pending |
| 01-05-02 | 05 | 2 | TESSY-01,TESSY-02,TESSY-03,TESSY-04,TESSY-05 | T-01-05-B | Shell carrega sem reload total, abre editor e mantem terminal acessivel | e2e | `npm run e2e -- --grep "smoke|foundation"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

- [ ] `tessy-antigravity-rabelus-lab/src/test/foundation/viewerRouting.test.tsx` - cobre sync viewer <-> History API
- [ ] `tessy-antigravity-rabelus-lab/src/test/foundation/editorHeader.test.tsx` - cobre switch de autosave e save manual
- [ ] `tessy-antigravity-rabelus-lab/src/test/foundation/fileOpenPolicy.test.ts` - cobre classificacao e gating de arquivo grande
- [ ] `tessy-antigravity-rabelus-lab/src/test/foundation/monacoSetup.test.ts` - cobre bootstrap local do Monaco
- [ ] `tessy-antigravity-rabelus-lab/src/test/foundation/realTerminal.test.tsx` - cobre estados do terminal
- [ ] `tessy-antigravity-rabelus-lab/src/test/foundation/terminalPreferences.test.ts` - cobre clamp/persistencia do scrollback
- [ ] `tessy-antigravity-rabelus-lab/e2e/foundation.spec.ts` - cobre fluxo fundacional complementar ao smoke

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Legibilidade do header compacto do editor com switch de autosave | TESSY-01 | A aprovacao visual do chrome do editor e melhor com inspeccao humana | Rodar `npm run dev`, abrir arquivo local, confirmar header compacto, switch antes das acoes destrutivas e badge coerente |
| Percepcao de fluidez ao escolher "Abrir normalmente" em arquivo grande | TESSY-05 | O teste automatizado nao mede bem a percepcao da degradacao | Abrir fixture grande, testar opcoes do modal e confirmar que o app permanece responsivo |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
