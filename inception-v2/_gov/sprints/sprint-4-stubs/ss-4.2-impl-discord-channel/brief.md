# ss-4.2 — impl-discord-channel (G5)

**Status:** ✅ done
**Gap:** G5 — `packages/channels/discord/src/index.ts` era `export {}`
**Branch:** `feat/gov-sprint-4`
**Depende de:** ss-4.1 (spec)

## O que foi feito

Implementado `DiscordChannel` em `packages/channels/discord/src/channel.ts`.

### Classe

```typescript
export class DiscordChannel implements IChannel {
  readonly id = ChannelId.Discord;
  readonly direction = MessageDirection.Bidirectional;
}
```

### Funcionalidades implementadas

- `initialize(config: DiscordConfig)` — valida `botToken` e `clientId`, cria `Client` discord.js com intents corretos, registra event handlers
- `start()` — faz `client.login(botToken)` (assíncrono)
- `stop()` — chama `client.destroy()`, transiciona para Disconnected
- `restart()` — stop + start
- `send(message)` — busca o TextChannel pelo `recipient.id`, envia a mensagem
- `onMessage(handler)` — armazena handler inbound
- `onError(handler)` / `onStateChange(handler)` — arrays de handlers

### Filtragem de segurança

- `msg.author.bot === true` → ignorado
- `allowedUserIds` → somente usuários da lista passam
- `guildIds` → somente servidores da lista passam (DMs sempre passam)

### Lifecycle de estados

```
initialize() → Connecting
start()      → (aguarda ClientReady) → Ready
stop()       → Disconnected
error()      → Error
```

### Decisions de scope

- Approval via reactions removida do escopo desta SS (feature futura)
- `setApprovalResolver()` também removido por ser inutilizável sem as reactions

### Dependências adicionadas

- `discord.js: ^14.0.0` em `dependencies`
- `@rabeluslab/inception-core: workspace:*` em `dependencies` (para `ChannelError`)

## Arquivos modificados/criados

- `packages/channels/discord/src/channel.ts` (novo — implementação)
- `packages/channels/discord/src/index.ts` (reescrito — exporta `DiscordChannel`)
- `packages/channels/discord/package.json` (dependências adicionadas)

## Verificação

- `pnpm build` → 30/30 verde
- TypeScript sem erros (`noUnusedLocals: true` respeitado)
