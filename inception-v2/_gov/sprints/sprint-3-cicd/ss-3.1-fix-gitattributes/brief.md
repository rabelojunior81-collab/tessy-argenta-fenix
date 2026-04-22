# ss-3.1 — fix-gitattributes (G14)

**Status:** ✅ done
**Gap:** G14 — `.gitattributes` ausente, warnings LF→CRLF em todo commit Windows
**Branch:** `feat/gov-sprint-3`

## O que foi feito

Criado `.gitattributes` na raiz com:

- `* text=auto eol=lf` — normaliza todos os arquivos texto para LF no checkout
- `*.sh text eol=lf` — scripts POSIX sempre LF
- `*.bat / *.cmd text eol=crlf` — arquivos Windows-specific mantêm CRLF
- Arquivos binários marcados como `binary` para evitar corrupção

## Verificação

`git diff --check` após commit não deve emitir warnings de whitespace em Windows.
