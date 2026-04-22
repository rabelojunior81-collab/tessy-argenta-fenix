import { InlineKeyboard } from 'grammy';

export interface ApprovalCallbackData {
  approvalId: string;
  approved: boolean;
}

/** Build InlineKeyboard for an approval request */
export function buildApprovalKeyboard(approvalId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Aprovar', `approval:${approvalId}:yes`)
    .text('❌ Rejeitar', `approval:${approvalId}:no`);
}

/** Parse callback_data for approval responses */
export function parseApprovalCallback(data: string): ApprovalCallbackData | undefined {
  const match = /^approval:([^:]+):(yes|no)$/.exec(data);
  if (!match) return undefined;
  return { approvalId: match[1], approved: match[2] === 'yes' };
}

/** Format approval request message body */
export function formatApprovalMessage(params: {
  toolName: string;
  toolDescription: string;
  args: Record<string, unknown>;
  missionId: string;
  expiresAt: string;
}): string {
  const argsText = JSON.stringify(params.args, null, 2);
  const expiry = new Date(params.expiresAt).toLocaleTimeString('pt-BR');
  return [
    '⚠️ *Aprovação Requerida*',
    '',
    `*Ferramenta:* \`${params.toolName}\``,
    `${params.toolDescription}`,
    '',
    '*Argumentos:*',
    `\`\`\`json\n${argsText}\n\`\`\``,
    '',
    `*Missão:* \`${params.missionId}\``,
    `*Expira às:* ${expiry}`,
  ].join('\n');
}
