export function isCommandAllowed(
  command: string,
  allowlist: readonly string[] | undefined
): boolean {
  if (!allowlist || allowlist.length === 0) return false; // deny by default if no allowlist
  const executable = command.trim().split(/\s+/)[0] ?? '';
  return allowlist.some((allowed) => {
    // Support exact match or glob-style prefix (e.g. "git" matches "git status")
    return (
      executable === allowed ||
      executable.endsWith('/' + allowed) ||
      executable.endsWith('\\' + allowed)
    );
  });
}
