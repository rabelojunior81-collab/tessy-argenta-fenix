import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import type {
  IChannel,
  ChannelConfig,
  OutboundMessage,
  InboundMessage,
  HTTPConfig,
} from '@rabeluslab/inception-types';
import {
  ChannelId,
  ChannelState,
  MessageDirection,
  ContentType,
  AutonomyLevel,
} from '@rabeluslab/inception-types';

type MessageHandler = (msg: InboundMessage) => Promise<void>;
type ErrorHandler = (err: Error) => void;
type StateHandler = (state: ChannelState) => void;

function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Simple newline-delimited JSON over SSE for outbound messages */
interface SseClient {
  res: ServerResponse;
  id: string;
}

export class HttpChannel implements IChannel {
  readonly id = ChannelId.HTTP;
  readonly direction = MessageDirection.Bidirectional;

  private _state: ChannelState = ChannelState.Initializing;
  private config!: HTTPConfig;
  private readonly server = createServer((req, res) => this.handleRequest(req, res));
  private sseClients: SseClient[] = [];

  private messageHandler?: MessageHandler;
  private errorHandler?: ErrorHandler;
  private stateHandler?: StateHandler;

  get state(): ChannelState {
    return this._state;
  }

  async initialize(config: ChannelConfig): Promise<void> {
    this.config = config as HTTPConfig;
    this.setState(ChannelState.Connecting);
  }

  async start(): Promise<void> {
    const { port = 3210, host = '127.0.0.1' } = this.config;
    await new Promise<void>((resolve, reject) => {
      this.server.listen(port, host, () => resolve());
      this.server.once('error', reject);
    });
    this.setState(ChannelState.Ready);
  }

  async stop(): Promise<void> {
    for (const client of this.sseClients) {
      client.res.end();
    }
    this.sseClients = [];
    await new Promise<void>((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()));
    });
    this.setState(ChannelState.Disconnected);
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async send(message: OutboundMessage): Promise<void> {
    const payload = JSON.stringify(message) + '\n';
    for (const client of this.sseClients) {
      client.res.write(`data: ${payload}\n\n`);
    }
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  onStateChange(handler: StateHandler): void {
    this.stateHandler = handler;
  }

  private setState(state: ChannelState): void {
    this._state = state;
    this.stateHandler?.(state);
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    // CORS
    const origins = this.config.cors?.origins ?? ['*'];
    const origin = req.headers.origin ?? '*';
    if (origins.includes('*') || origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Auth check
    if (!this.checkAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', channel: 'http', state: this._state }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/events') {
      this.handleSse(req, res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/message') {
      this.handleInbound(req, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private handleSse(_req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(':ok\n\n');

    const client: SseClient = { res, id: generateId() };
    this.sseClients.push(client);

    res.on('close', () => {
      this.sseClients = this.sseClients.filter((c) => c.id !== client.id);
    });
  }

  private handleInbound(req: IncomingMessage, res: ServerResponse): void {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
      if (body.length > 64 * 1024) req.destroy(new Error('Request too large'));
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body) as { text?: string; threadId?: string; senderId?: string };
        const msg: InboundMessage = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          channel: ChannelId.HTTP,
          threadId: parsed.threadId,
          direction: MessageDirection.Inbound,
          sender: {
            id: parsed.senderId ?? 'http-operator',
            name: parsed.senderId ?? 'HTTP Operator',
            role: 'operator',
          },
          content: {
            type: ContentType.Text,
            body: parsed.text ?? '',
          },
          metadata: {
            autonomyLevel: AutonomyLevel.Supervised,
            requiresApproval: false,
          },
        };

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: msg.id, status: 'accepted' }));

        if (this.messageHandler) {
          this.messageHandler(msg).catch((err) => this.errorHandler?.(err as Error));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    req.on('error', (err: Error) => {
      this.errorHandler?.(err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
      }
    });
  }

  private checkAuth(req: IncomingMessage): boolean {
    if (!this.config.auth || this.config.auth.type === 'none') return true;
    if (!this.config.auth.secret) return true;

    if (this.config.auth.type === 'bearer') {
      const auth = req.headers.authorization ?? '';
      return auth === `Bearer ${this.config.auth.secret}`;
    }
    if (this.config.auth.type === 'apikey') {
      const key = req.headers['x-api-key'] ?? '';
      return key === this.config.auth.secret;
    }
    return false;
  }
}
