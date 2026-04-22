# Sync Policy

This repository is the master hub for the Exossistema Rabelus.

## Fixed closure rule

When a phase changes any module that also exists as an individual repository, the sync must always close in two steps:

1. Commit and push the individual module repository first.
2. Mirror the resulting state into this master repository and push it second.

The phase is not considered fully closed until both repositories are published.

## Scope

- `tessy-antigravity-rabelus-lab`
- `inception-v2`
- `inception-tui`
- Shared master assets and landing-page content

## Rules

- Never overwrite the individual module repositories from the master repository.
- Keep the master repository as a curated mirror plus landing hub.
- Use Git LFS for large binary assets such as videos.
- Exclude local-only helpers and machine-specific files such as `.claude` and similar workspace-only artifacts.
- If the master repository diverges from its remote, integrate history safely instead of replacing it blindly.

## Operational intent

The master repository is the canonical place to see the whole system, but it does not replace module-local ownership.
The module repo remains the source of truth for its own implementation history.
