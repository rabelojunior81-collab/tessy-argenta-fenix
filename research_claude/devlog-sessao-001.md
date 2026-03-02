# Devlog — Sessão 001

**Data:** 2026-03-02
**Repositório:** tessy-argenta-fenix
**Branch:** main
**Desenvolvedor:** Rabelus Lab

---

## Contexto da Sessão

Sessão inaugural de setup e modernização da Tessy no novo repositório GitHub `tessy-argenta-fenix`. O objetivo foi preparar o ambiente de desenvolvimento, atualizar todas as dependências e garantir que a Tessy rode com os modelos e pacotes mais atualizados disponíveis em março de 2026.

---

## O que foi feito

### 1. Criação do CLAUDE.md
Arquivo de orientação para futuras instâncias do Claude Code. Documenta arquitetura, comandos, convenções e decisões técnicas do projeto.

### 2. Análise e setup do ambiente
- Identificado que o código fonte real está em `tessy_legacy/` (não na raiz do repositório)
- `node_modules` estava ausente — projeto nunca instalado nessa máquina
- Criado `.gitignore` na raiz excluindo `.claude/`, `node_modules/`, `.env`

### 3. Atualização holística de dependências

**Pacotes atualizados (minor/patch — safe):**
| Pacote | De | Para |
|---|---|---|
| `@google/genai` | 1.34.0 | 1.43.0 |
| `dexie` | 4.0.11 | 4.3.0 |
| `framer-motion` | 12.23.26 | 12.34.4 |
| `isomorphic-git` | 1.36.1 | 1.37.2 |
| `puppeteer` / `puppeteer-core` | 24.35.0 | 24.37.5 |
| `react` / `react-dom` | 19.2.3 | 19.2.4 |

**Pacotes atualizados (major — com correção de CVEs):**
| Pacote | De | Para | Motivo |
|---|---|---|---|
| `jspdf` | 2.5.1 | 4.2.0 | CVE: DOMPurify XSS (GHSA-vhxf-7vqr-mrjg) |
| `react-syntax-highlighter` | 15.6.1 | 16.1.1 | CVE: PrismJS DOM Clobbering (GHSA-x7hr-w5r2-h6wg) |
| `axios` | 1.13.2 | 1.13.6 | CVE: DoS via __proto__ (GHSA-43fc-jf86-j433) |

**Mantido pinado (intencional):**
- `lucide-react`: `0.460.0` — ícones `Edit3`, `Github` e outros podem não existir em versões superiores

**Resultado:** `npm audit` → **0 vulnerabilidades** | `tsc --noEmit` → **0 erros TypeScript**

### 4. Atualização dos modelos Gemini

**Arquivo:** `services/gemini/client.ts` e `contexts/ChatContext.tsx`

| Modelo | Antes | Depois | Status |
|---|---|---|---|
| MODEL_FLASH | `gemini-3-flash-preview` | `gemini-3-flash-preview` | Mantido (ainda válido) |
| MODEL_PRO | `gemini-3-pro-preview` | `gemini-3.1-pro-preview` | Atualizado (antigo em descontinuação) |
| MODEL_LITE | `gemini-flash-lite-latest` | `gemini-2.5-flash-lite` | Atualizado (ID estável correto) |

### 5. Pesquisa: Acesso Remoto ao Claude Code (plano Pro)

Contexto: Claude Code Remote Control exige plano Max. Alternativa documentada.

**Roadmap criado:** `research_claude/roadmap-remote-access.md`
- Fase 1: Tailscale (VPN mesh gratuita)
- Fase 2: OpenSSH Server no Windows
- Fase 3: tmux (sessão persistente)
- Fase 4: Acesso à UI do Tessy remotamente

### 6. Criação do repositório GitHub
- Repositório: `tessy-argenta-fenix` (público/privado conforme configurado)
- Commit inicial com todo o projeto sincronizado

---

## Decisões Técnicas Documentadas

### Por que manter `lucide-react` em 0.460.0?
A versão 0.460.0 está **pinada sem caret** no package.json original — indicação intencional do desenvolvedor. Versão 0.475.0 teve bug de runtime failure com exports. Ícones como `Edit3` foram removidos em versões anteriores e podem não existir nas versões superiores. **Risco alto sem ganho imediato.**

### Por que manter `react-markdown` em ^9 (não v10)?
React-markdown v10 removeu a prop `inline` do componente `code`. O código do `CoPilot.tsx` usa `inline` para diferenciar code blocks de inline code. A migração para v10 requereria refatorar o renderer de código — **tarefa para uma sessão dedicada**.

### Por que usar `gemini-3.1-pro-preview` em vez de `gemini-2.5-pro`?
`gemini-3-pro-preview` estava sendo descontinuado. O `gemini-3.1-pro-preview` é o sucessor natural com capacidades agênticas mais avançadas. O `gemini-2.5-pro` (stable) é uma alternativa conservadora se preview causar instabilidade.

---

## Próximos Passos (Sessão 002+)

Foco no repositório `tessy_legacy/` com controle granular:

- [ ] Migrar `react-markdown` para v10 e corrigir o renderer de código inline/block
- [ ] Atualizar `lucide-react` para versão atual com mapeamento de ícones renomeados
- [ ] Implementar roadmap de acesso remoto (Tailscale + SSH + tmux)
- [ ] Refinar o sistema de factors no `ChatContext.tsx`
- [ ] Avaliar migração do `MODEL_PRO` para `gemini-2.5-pro` (stable) para maior estabilidade

---

## Estado Final da Sessão

```
✅ node_modules instalado
✅ 0 vulnerabilidades (npm audit)
✅ 0 erros TypeScript (tsc --noEmit)
✅ Modelos Gemini atualizados
✅ Repositório GitHub criado e sincronizado
✅ CLAUDE.md atualizado
✅ MEMORY.md atualizado
✅ Devlog registrado
```

---

*Gerado por Claude Code (claude-sonnet-4-6) — Rabelus Lab × Tessy Argenta Fênix*
