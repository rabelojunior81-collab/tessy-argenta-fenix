# Security Policy

## Reporting vulnerabilities

If you find a security issue in this master repository, report it through GitHub Security Advisories or open a private communication channel with the maintainers.

## Security assumptions

- No secrets should be committed to the repository.
- Local-only agent files and machine-specific settings must stay out of version control.
- Large binary assets are archived here for presentation purposes only; they are not trusted as runtime inputs.

## Sensitive areas

- Any future automation that publishes or syncs sub-repositories.
- Any workflow that touches authentication tokens.
- Any future deployment of the landing page.

## Safe handling

- Prefer environment variables for tokens.
- Review asset provenance before reusing new media.
- Keep repo-level metadata and archive content clearly separated.
