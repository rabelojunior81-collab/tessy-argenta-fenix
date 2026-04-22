# ss-4.1 — spec-discord-channel (G5 — spec)

**Status:** ✅ done
**Gap:** G5 (spec fase) — `packages/channels/discord/src/index.ts` é `export {}`
**Branch:** `feat/gov-sprint-4`
**Bloqueia:** ss-4.2 (implementação)

---

## Análise do Estado Atual

```
packages/channels/discord/
├── src/index.ts          ← export {}  (stub)
├── package.json          ← sem discord.js
└── tsconfig.json
```

O `ChannelId.Discord` e `DiscordConfig` já existem em `@rabeluslab/inception-types`:

```typescript
// packages/types/src/channels.ts
export enum ChannelId {
  Discord = 'discord', // já existe
}

export interface DiscordConfig extends BaseChannelConfig {
  readonly botToken: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly guildIds?: readonly string[];
  readonly allowedUserIds: readonly string[];
}
```

---

## Padrão de Referência: TelegramChannel

`packages/channels/telegram/src/channel.ts` é o padrão a seguir.
Estrutura:

- `class TelegramChannel implements IChannel`
- `initialize(config)` → validação + setup do client
- `start()` → inicia polling/webhook
- `stop()` → para o bot
- `send(message)` → envia para o chat
- `onMessage(handler)` → armazena handler
- `onError(handler)` / `onStateChange(handler)` → arrays de handlers
- `setApprovalResolver(fn)` → integração com AgentLoop

---

## Spec Técnica: DiscordChannel

### Dependência

```json
"discord.js": "^14.0.0"
```

Discord.js v14 usa o padrão `Client` com gateway intents.

### Classe

```typescript
import { Client, GatewayIntentBits, Events, type Message } from 'discord.js';

export class DiscordChannel implements IChannel {
  readonly id = ChannelId.Discord;
  readonly direction = MessageDirection.Bidirectional;
}
```

### Intents necessários

```typescript
new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // requer privileged intent no Portal
    GatewayIntentBits.DirectMessages,
  ],
});
```

### Fluxo de mensagens inbound

1. `client.on(Events.MessageCreate, handler)` — recebe mensagem
2. Verificar: `msg.author.bot === false` (ignorar bots)
3. Verificar: `allowedUserIds.includes(msg.author.id)` — apenas usuários autorizados
4. Construir `InboundMessage` com `channel: ChannelId.Discord`
5. Chamar `this.inboundHandler(inbound)`

### Fluxo outbound (send)

1. Resolver `channelId` do recipient — `message.recipient.id` é o Discord channel ID
2. `client.channels.fetch(channelId)` → obter `TextChannel`
3. `textChannel.send(text)` — com markdown Discord (bold, code blocks)

### Approval via reactions

Ao enviar uma mensagem de aprovação, adicionar reactions ✅ e ❌.
Aguardar `messageReactionAdd` do usuário autorizado.
Chamar `approvalResolver(approvalId, approved)`.

### Configuração de guild filter

Se `guildIds` estiver definido, processar apenas mensagens de servidores na lista.
DMs são processados independentemente de `guildIds`.

### Lifecycle

```
initialize() → Connecting
start()      → await client.login(botToken) → Ready
stop()       → client.destroy() → Disconnected
```

### Tratamento de erros

- `client.on(Events.Error, handler)` → propaga para `errorHandlers`
- `client.on(Events.Warn, msg)` → log de warning
- Login falhou → estado Error, propagar erro

---

## Estrutura de arquivos (ss-4.2)

```
packages/channels/discord/src/
├── index.ts      ← exporta DiscordChannel
└── channel.ts    ← implementação (padrão Telegram)
```

### package.json

```json
{
  "dependencies": {
    "@rabeluslab/inception-types": "workspace:*",
    "@rabeluslab/inception-core": "workspace:*",
    "discord.js": "^14.0.0"
  }
}
```

---

## Critérios de Aceite (ss-4.2)

- [ ] `DiscordChannel implements IChannel` — TypeScript sem erros
- [ ] `start()` faz login com o token
- [ ] `stop()` chama `client.destroy()`
- [ ] `send()` envia para o TextChannel correto
- [ ] `onMessage()` recebe mensagens de usuários autorizados
- [ ] `allowedUserIds` filtra mensagens
- [ ] `guildIds` filtra por servidor (se definido)
- [ ] `pnpm build` verde
