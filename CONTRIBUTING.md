# Contributing

## Rules of engagement

- Keep the master repo focused on orchestration, documentation, and the landing page.
- Do not overwrite the independent repositories:
  - `tessy-antigravity-rabelus-lab`
  - `repo-manus-hackathon`
  - `inception-v2`
  - `inception-tui`
- Exclude local-only helper directories such as `.claude/`, `.codex/`, `.tmp/`, and editor/runtime caches.

## Commit style

Use conventional commits:

- `docs:` for documentation and landing page updates
- `feat:` for new master-repo capabilities
- `chore:` for maintenance and archive updates

## Pull requests

- Keep changes scoped.
- Include a short summary of what was touched and why.
- If assets are added, mention their source archive.

## Validation

Before opening a PR:

1. Check the landing page locally.
2. Confirm links to the module repositories still resolve.
3. Avoid introducing secrets or machine-local files.
