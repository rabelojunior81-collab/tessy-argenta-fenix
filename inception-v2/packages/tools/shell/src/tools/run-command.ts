import { spawn } from 'node:child_process';
import path from 'node:path';

import type {
  ExecutionContext,
  ITool,
  JSONObject,
  ToolDefinition,
  ToolExecutionResult,
} from '@rabeluslab/inception-types';
import { GateType } from '@rabeluslab/inception-types';

import { isCommandAllowed } from '../allowlist.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 300_000;
const MAX_OUTPUT_BYTES = 1_048_576; // 1 MiB per stream

export class RunCommandTool implements ITool {
  readonly definition: ToolDefinition = {
    id: 'run_command',
    name: 'Run Command',
    description: 'Executes a shell command from the allowlist within the workspace.',
    gate: GateType.Security,
    dangerous: true,
    readOnly: false,
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute. Must be in the allowlist.',
          required: true,
        },
        cwd: {
          type: 'string',
          description: 'Working directory (relative to workspacePath). Defaults to workspacePath.',
        },
        env: {
          type: 'object',
          description: 'Additional environment variables to merge with the current environment.',
        },
        timeout: {
          type: 'number',
          description: `Timeout in milliseconds (default ${DEFAULT_TIMEOUT_MS}, max ${MAX_TIMEOUT_MS}).`,
          default: DEFAULT_TIMEOUT_MS,
        },
        stdin: {
          type: 'string',
          description: 'Optional data to pipe into the command stdin.',
        },
      },
      required: ['command'],
    },
    returns: {
      type: 'object',
      description: 'Command execution result.',
      properties: {
        stdout: { type: 'string', description: 'Standard output.' },
        stderr: { type: 'string', description: 'Standard error.' },
        exitCode: { type: 'number', description: 'Process exit code.' },
        command: { type: 'string', description: 'The command that was executed.' },
        cwd: { type: 'string', description: 'Working directory used.' },
      },
    },
  };

  validate(args: unknown): args is JSONObject {
    return typeof args === 'object' && args !== null && !Array.isArray(args);
  }

  async execute(args: JSONObject, context: ExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();

    const command = args['command'] as string;
    const timeout = Math.min(
      (args['timeout'] as number | undefined) ?? DEFAULT_TIMEOUT_MS,
      MAX_TIMEOUT_MS
    );
    const stdinData = args['stdin'] as string | undefined;
    const extraEnv = (args['env'] as Record<string, string> | undefined) ?? {};

    // ── Allowlist check ────────────────────────────────────────────────────────
    if (!isCommandAllowed(command, context.allowlist.commands)) {
      const executable = command.trim().split(/\s+/)[0] ?? command;
      return {
        success: false,
        error: {
          code: 'COMMAND_NOT_ALLOWED',
          message: context.allowlist.commands?.length
            ? `Command not in allowlist: "${executable}"`
            : 'Command execution not allowed: no allowlist configured.',
        },
        metadata: { executionTimeMs: Date.now() - start },
      };
    }

    // ── Resolve cwd ───────────────────────────────────────────────────────────
    const rawCwd = args['cwd'] as string | undefined;
    const cwd = rawCwd ? path.resolve(context.workspacePath, rawCwd) : context.workspacePath;

    // ── Spawn ─────────────────────────────────────────────────────────────────
    return new Promise<ToolExecutionResult>((resolve) => {
      let stdoutBuf = '';
      let stderrBuf = '';
      let finished = false;
      let timedOut = false;

      const child = spawn(command, {
        cwd,
        env: { ...process.env, ...extraEnv },
        shell: true,
      });

      // Timeout watchdog
      const timer = setTimeout(() => {
        if (!finished) {
          timedOut = true;
          child.kill('SIGTERM');
        }
      }, timeout);

      // Abort signal
      const onAbort = (): void => {
        if (!finished) child.kill('SIGTERM');
      };
      context.signal.addEventListener('abort', onAbort, { once: true });

      child.stdout?.on('data', (chunk: Buffer) => {
        if (stdoutBuf.length < MAX_OUTPUT_BYTES) {
          stdoutBuf += chunk.toString('utf8');
          if (stdoutBuf.length > MAX_OUTPUT_BYTES) {
            stdoutBuf = stdoutBuf.slice(0, MAX_OUTPUT_BYTES) + '\n[TRUNCATED]';
          }
        }
      });

      child.stderr?.on('data', (chunk: Buffer) => {
        if (stderrBuf.length < MAX_OUTPUT_BYTES) {
          stderrBuf += chunk.toString('utf8');
          if (stderrBuf.length > MAX_OUTPUT_BYTES) {
            stderrBuf = stderrBuf.slice(0, MAX_OUTPUT_BYTES) + '\n[TRUNCATED]';
          }
        }
      });

      // Write stdin
      if (stdinData !== undefined && child.stdin) {
        child.stdin.write(stdinData);
        child.stdin.end();
      }

      child.on('close', (code) => {
        finished = true;
        clearTimeout(timer);
        context.signal.removeEventListener('abort', onAbort);

        const exitCode = code ?? -1;
        const executionTimeMs = Date.now() - start;

        if (timedOut) {
          resolve({
            success: false,
            error: {
              code: 'TIMEOUT',
              message: `Command timed out after ${timeout}ms.`,
              details: { stdout: stdoutBuf, stderr: stderrBuf },
            },
            metadata: { executionTimeMs, exitCode, stdout: stdoutBuf, stderr: stderrBuf },
          });
          return;
        }

        if (context.signal.aborted) {
          resolve({
            success: false,
            error: { code: 'ABORTED', message: 'Command was aborted.' },
            metadata: { executionTimeMs, exitCode, stdout: stdoutBuf, stderr: stderrBuf },
          });
          return;
        }

        resolve({
          success: exitCode === 0,
          data: { stdout: stdoutBuf, stderr: stderrBuf, exitCode, command, cwd },
          metadata: { executionTimeMs, exitCode, stdout: stdoutBuf, stderr: stderrBuf },
        });
      });

      child.on('error', (err) => {
        finished = true;
        clearTimeout(timer);
        context.signal.removeEventListener('abort', onAbort);

        resolve({
          success: false,
          error: { code: 'EXEC_ERROR', message: err.message },
          metadata: { executionTimeMs: Date.now() - start },
        });
      });
    });
  }
}
