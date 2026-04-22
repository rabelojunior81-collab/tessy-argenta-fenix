---
id: ss-1.4
sprint: sprint-1-memory-docs
fase: docs
alvo: security-md-update
status: in-progress
criado-em: 2026-03-25T00:00:00Z
branch: feat/gov-sprint-1
---

# Brief: Atualizar SECURITY.md

## Objetivo

Enriquecer `SECURITY.md` com referência ao `SecurityManager` real implementado, documentar os gates de aprovação e o modelo de confiança do runtime.

## Contexto

`SECURITY.md` atual é genérico — não menciona `packages/security/src/security-manager.ts` (que está completo com SSRF, path traversal, command injection, pairing). Um desenvolvedor lendo o SECURITY.md não sabe que há um SecurityManager robusto já implementado.

## Scope

### Dentro:

- Adicionar seção "Implementação de Segurança" no SECURITY.md
- Referenciar `packages/security/src/security-manager.ts`
- Documentar os gates de aprovação do AgentLoop
- Documentar o modelo de confiança (approvalGate, sandbox, pairing)

### Fora:

- Modificar o SecurityManager em si
- Criar novos mecanismos de segurança

## Spec Técnica

### Arquivo a modificar:

- `SECURITY.md` (raiz)

### Seções a adicionar:

1. **Runtime Security Gates** — ApprovalGate, AutonomyLevel
2. **SecurityManager** — link para código + o que protege (SSRF, path traversal, injection, pairing)
3. **Configuração** — como configurar `security` no `.inception.json`

## Validação

### Testes do Claude (automated):

- [ ] `SECURITY.md` menciona `packages/security/src/security-manager.ts`
- [ ] `SECURITY.md` menciona ApprovalGate
- [ ] `SECURITY.md` menciona SSRF, path traversal, command injection

### Testes do Usuário (manual):

- [ ] Confirmar que é útil para um desenvolvedor entender o modelo de segurança

## Commit Message

Integrado ao commit principal da Sprint 1.

## Definition of Done

- [ ] `SECURITY.md` referencia o SecurityManager real
- [ ] `SECURITY.md` documenta os gates de aprovação
- [ ] `SECURITY.md` tem seção de configuração
