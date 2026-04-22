# MISSION BRIEFING
**ID:** project-switch-and-wallpaper-2026-03
**Sprint:** E
**Data:** 2026-03-07
**Agente Executor:** Tessy Dev Agent (autonomo)
**Status:** IN PROGRESS

---

## Objetivo

Dois gaps de UX/consistencia identificados pelo operador:

### E1 — Project Switch: Consistencia de Contexto
Ao trocar de projeto, o ChatContext (Tessy Copilot) nao atualiza. O problema raiz:
- `ChatProvider` recebe `initialProjectId` (prop estatica em `App.tsx`)
- `useProjects.switchProject()` atualiza o estado local do hook, mas `ChatProvider` nunca ve o novo ID
- `newConversation()` chamada como `onProjectSwitched` usa o `currentProjectId` desatualizado

**Resultado esperado:** Ao trocar de projeto, o painel de chat carrega automaticamente a ultima conversa aberta naquele projeto. Se nao houver conversas, cria uma nova.

### E2 — Wallpaper Upload: Imagem Local como Fundo
O `VisualSettingsModal` oferece apenas 8 wallpapers predefinidos (Unsplash). O operador quer poder fazer upload de imagens locais como fundo, com persistencia (IndexedDB, nao localStorage — imagens sao grandes) e possibilidade de exclusao.

**Resultado esperado:** Botao de upload no modal de aparencia, galeria de imagens customizadas com botao de exclusao, persistencia em `db.settings`.

---

## Escopo Tecnico

### E1 — Arquivos afetados
- `contexts/ChatContext.tsx` — adicionar `activeProjectId` state + expor `setCurrentProjectId`
- `App.tsx` — sincronizar `currentProjectId` do `useProjects` via `useEffect`

### E2 — Arquivos afetados
- `contexts/VisualContext.tsx` — `CustomWallpaper` type, CRUD, IndexedDB persistence
- `components/modals/VisualSettingsModal.tsx` — upload button, custom wallpaper grid

---

## Restricoes
- TSP workflow: commits atomicos por sub-tarefa
- Sem quebrar contrato de tipos existentes
- Nao usar `.env` ou variaveis de ambiente
- Sem adicionar bibliotecas novas
