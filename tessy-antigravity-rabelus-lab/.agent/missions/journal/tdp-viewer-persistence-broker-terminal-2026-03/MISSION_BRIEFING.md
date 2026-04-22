# MISSION BRIEFING
## Missao: tdp-viewer-persistence-broker-terminal-2026-03

**Status:** `EM_EXECUCAO`  
**Tipo:** `PROGRAMA_ESTRUTURAL`  
**Executor:** `Codex GPT-5`  
**Data:** `2026-03-08`

---

## 1. Objetivo

Eliminar o remount destrutivo dos viewers laterais e fechar o gap estrutural do terminal, introduzindo um broker local que resolva `cwd` real por projeto/workspace.

---

## 2. Escopo

### Eixo A — Viewer Persistence

- manter viewers montados mesmo quando fechados ou alternados;
- preservar estado visual entre trocas;
- reduzir recarga de árvore/listagens ao navegar na shell lateral.

### Eixo B — Broker Terminal

- formalizar broker local Node como autoridade de `absolutePath`;
- registrar e validar workspace local real por `workspaceId`;
- abrir PTY no `cwd` correto do projeto;
- bloquear terminal quando o broker não validar a workspace.

### Eixo C — Hygiene e Legado

- arquivar artefatos legados aprovados em journal/dados;
- classificar `nul` como artefato não acionável até investigação segura.

---

## 3. Decisoes aprovadas pelo operador

- broker local em Node;
- `absolutePath` fica no broker, não no app web;
- broker vira modo preferencial do terminal;
- escopo inicial do broker: registro, validação de workspace e sessão PTY com `cwd`;
- `.claude/` deve ir para legado;
- `nul` só deve ser tocado se houver forma segura.

---

## 4. Critérios de aceite

- fechar/reabrir o painel de arquivos não reinicializa o viewer;
- trocar de `files` para `history` e voltar preserva estado do viewer;
- terminal só conecta com workspace registrada e validada no broker;
- PTY nasce no `cwd` registrado para o `workspaceId`;
- broker falho/inválido mostra overlay acionável e não abre shell;
- documentação da missão e do TDP atualizada;
- `npx tsc --noEmit` deve passar.

---

## 5. Riscos iniciais

- sincronizar estado de viewers sem introduzir vazamento de efeitos;
- não existe path absoluto acessível pelo browser, então o primeiro ciclo precisa de registro explícito no broker;
- risco de drift entre metadata local do app e registro do broker;
- risco de UX excessivamente técnica no primeiro registro de workspace real.

---

## 6. Estratégia

- Fase 1: host persistente de viewers;
- Fase 2: schema canônico de workspace + broker metadata;
- Fase 3: broker local e endpoints de registro/validação/sessão;
- Fase 4: integração do terminal ao broker;
- Fase 5: hygiene, docs, changelog, validação.
