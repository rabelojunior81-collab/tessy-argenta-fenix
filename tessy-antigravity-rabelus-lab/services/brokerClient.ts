const BROKER_HOST = '127.0.0.1';
const BROKER_PORT = 3002;

export interface BrokerHealth {
  status: 'ok';
  shell: string;
  mode: 'broker';
}

export interface BrokerWorkspaceRegistrationInput {
  workspaceId: string;
  projectId: string;
  displayName: string;
  absolutePath: string;
  githubCloneUrl?: string;
}

export interface BrokerWorkspaceStatus {
  workspaceId: string;
  exists: boolean;
  isGitRepo: boolean;
  registeredAt: number;
  validatedAt: number;
  absolutePath: string;
  githubCloneUrl?: string;
}

export const getBrokerBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  return `${protocol}://${BROKER_HOST}:${BROKER_PORT}`;
};

export const getBrokerWsUrl = (sessionToken: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${BROKER_HOST}:${BROKER_PORT}/terminal?session=${encodeURIComponent(sessionToken)}`;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parse errors and keep HTTP status
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function getBrokerHealth(): Promise<BrokerHealth> {
  const response = await fetch(`${getBrokerBaseUrl()}/health`);
  return parseJsonResponse<BrokerHealth>(response);
}

export async function registerBrokerWorkspace(
  input: BrokerWorkspaceRegistrationInput
): Promise<BrokerWorkspaceStatus> {
  const response = await fetch(`${getBrokerBaseUrl()}/workspaces/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<BrokerWorkspaceStatus>(response);
}

export async function validateBrokerWorkspace(workspaceId: string): Promise<BrokerWorkspaceStatus> {
  const response = await fetch(`${getBrokerBaseUrl()}/workspaces/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workspaceId }),
  });
  return parseJsonResponse<BrokerWorkspaceStatus>(response);
}

export async function createBrokerTerminalSession(
  workspaceId?: string
): Promise<{ token: string; expiresInMs: number }> {
  const response = await fetch(`${getBrokerBaseUrl()}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workspaceId ? { workspaceId } : {}),
  });
  return parseJsonResponse<{ token: string; expiresInMs: number }>(response);
}
