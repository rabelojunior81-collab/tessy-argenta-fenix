# Runbook de Sync — Superproject Rabelus

Este documento é o contrato operacional do superproject.

Use-o quando precisar instalar, inspecionar, simular, sincronizar, importar ou recuperar o workflow root/módulo.

---

## 1. Vocabulário

### Superproject

O repositório root em `E:\tessy-argenta-fenix`.

Contém planejamento, docs, tooling compartilhado e o workflow de orquestração.

### Módulo

Um dos três repositórios L1 embarcados:

- `tessy-antigravity-rabelus-lab`
- `inception-v2`
- `inception-tui`

Cada módulo tem seu próprio diretório `.git/` e seu próprio `origin` no GitHub.

### Sync Outbound

Operação disparada a partir do root que commita e faz push das mudanças locais de um módulo para o repositório desse módulo.

### Reconciliação Inbound

Operação manual no root que atualiza a referência do módulo após o histórico do módulo ter avançado.

### Estado Bloqueado

Estado em que o tooling recusa qualquer mutação no root ou nos módulos.

O operador deve resolver a ambiguidade antes de continuar.

---

## 2. Regras de Topologia

A estrutura atual do workspace é intencional.

Os módulos são repositórios embarcados dentro do root.

O root não usa `.gitmodules`.

O root não usa comandos de gerenciamento de submódulos como workflow primário.

O health check do root deve ignorar ruído de sujeira dos módulos:

```powershell
git status --porcelain=v1 --ignore-submodules=dirty
```

Para obter a verdade real de arquivos de um módulo, inspecione o módulo de dentro do seu próprio repositório.

---

## 3. Regras de Segurança

Nunca force sync através de um estado ambíguo.

Nunca faça auto-merge de históricos do root e dos módulos.

Nunca reescreva o remote de um módulo a partir de um caminho não revisado no root.

Nunca trate remote ausente, mismatch de remote ou divergência como estado seguro.

Sempre use `-DryRun` antes da primeira execução real em uma nova máquina.

Sempre rode o comando de status se não tiver certeza sobre o próximo passo seguro.

---

## 4. Instalação

O installer é idempotente. Ele pode:

- Validar que o root é um repositório Git
- Reportar o `origin` atual e o desejado
- Adicionar ou atualizar o `origin` do root
- Instalar um entry point thin em `.git/hooks/post-commit`
- Manter a lógica rastreada em `.githooks/`

### Simulação (Dry Run)

```powershell
pwsh -File scripts/sync/install-superproject-sync.ps1 -DryRun
```

### Aplicação

```powershell
pwsh -File scripts/sync/install-superproject-sync.ps1
```

### Flags Opcionais

```powershell
pwsh -File scripts/sync/install-superproject-sync.ps1 -Help
pwsh -File scripts/sync/install-superproject-sync.ps1 -SkipOrigin
pwsh -File scripts/sync/install-superproject-sync.ps1 -SkipHooks
pwsh -File scripts/sync/install-superproject-sync.ps1 -OriginUrl https://github.com/<owner>/<repo>
```

---

## 5. Comando de Status

Comece aqui sempre que a saúde do sync estiver incerta.

```powershell
pwsh -File scripts/sync/superproject-sync-status.ps1
```

O comando de status reporta:

- Branch do root
- Estado do `origin` do root
- Saúde do root
- Branch de cada módulo
- Match de remote
- Estado ahead/behind
- Sujeira do módulo
- Se o sync outbound está seguro
- Se a reconciliação inbound está pronta
- O próximo comando recomendado

### Modo JSON

```powershell
pwsh -File scripts/sync/superproject-sync-status.ps1 -Json
```

Use o modo JSON para wrappers ou automação futura.

---

## 6. Sync Outbound

O sync outbound é o caminho disparado a partir do root.

É implementado por `superproject-sync.ps1`.

O hook `post-commit` instalado chama o mesmo script após commits no root.

### Simulação

```powershell
pwsh -File scripts/sync/superproject-sync.ps1 -DryRun
```

### Execução Real

```powershell
pwsh -File scripts/sync/superproject-sync.ps1
```

### Execução Restrita a um Módulo

```powershell
pwsh -File scripts/sync/superproject-sync.ps1 -Module tessy -DryRun
```

### O que o Script Faz

1. Carrega a config rastreada.
2. Resolve os repositórios de módulo configurados.
3. Detecta quais módulos configurados estão sujos localmente.
4. Valida o remote e o estado de branch de cada módulo candidato.
5. Faz fetch do upstream (exceto com `-NoFetch`).
6. Bloqueia em remote ausente, mismatch, atraso ou divergência.
7. Faz stage e commit das mudanças do repositório do módulo.
8. Faz push do commit do módulo para o `origin`.
9. Informa ao operador se um passo de reconciliação do root agora é necessário.

### Mensagem de Commit Padronizada

Commits outbound de módulo usam o padrão:

```text
sync: auto-commit from superproject (<module>) [root <sha>]
```

### Realidade Importante

Como o root atualmente mantém entradas de repositório de módulo embarcado, um sync outbound bem-sucedido normalmente deixa uma mudança de ponteiro no root para reconciliar.

Isso é esperado. Não é tratado como sync falho.

Revise com o import script ou com revisão Git normal do root antes de commitar.

---

## 7. Comportamento do Hook

Fontes de hook rastreadas ficam aqui:

- `.githooks/post-commit`
- `.githooks/post-commit.ps1`

O installer escreve um delegador thin para `.git/hooks/post-commit`.

### Bypass

Defina `SUPERPROJECT_SYNC_BYPASS=1` antes do commit quando quiser pular deliberadamente a execução automática outbound.

```powershell
$env:SUPERPROJECT_SYNC_BYPASS = '1'
git commit -m "docs: mudança somente no root"
Remove-Item Env:SUPERPROJECT_SYNC_BYPASS
```

### Proteção contra Re-entrada

O hook usa `SUPERPROJECT_SYNC_ACTIVE=1` internamente para evitar execução recursiva.

---

## 8. Reconciliação Inbound

O sync inbound é sempre explícito.

Use `import-module-changes.ps1` para um módulo por vez.

### Simulação

```powershell
pwsh -File scripts/sync/import-module-changes.ps1 -Module tessy -DryRun
```

### Execução Real

```powershell
pwsh -File scripts/sync/import-module-changes.ps1 -Module tessy
```

### O que o Script Verifica

1. O módulo selecionado existe na config rastreada.
2. O repositório root é válido.
3. O repositório do módulo é válido.
4. A working tree do módulo está limpa.
5. O root não tem mudanças não relacionadas.
6. A referência de módulo rastreada pelo root e o `HEAD` do módulo formam uma cadeia de ancestralidade segura.

### O que o Script Faz

Neste formato de repositório, a reconciliação inbound faz o stage da entrada do módulo embarcado no root.

Também faz preview do diff de arquivos entre a referência de módulo rastreada pelo root e o `HEAD` atual do módulo.

Isso torna a mudança no root revisável antes de você commitá-la.

### Após um Import Real

Revise a mudança staged no root:

```powershell
git diff --cached -- inception-v2
```

Em seguida commite explicitamente:

```powershell
git commit -m "sync: import inception-v2 after module reconciliation"
```

---

## 9. Condições de Bloqueio

O tooling bloqueia em vez de adivinhar quando:

| Condição | Por que Bloqueia | Recuperação |
|---|---|---|
| `origin` do root ausente | Passo de instalação incompleto | Execute o installer |
| Remote do módulo ausente | Alvo de push desconhecido | Corrija o `origin` do módulo |
| Mismatch de remote do módulo | Repositório alvo errado | Corrija a config ou o remote antes do sync |
| Módulo atrás do upstream | Base local está stale | Fetch e rebase/pull dentro do repo do módulo |
| Módulo divergiu do upstream | Push automático poderia esconder conflitos | Resolva dentro do repo do módulo primeiro |
| Working tree do módulo suja durante import | Import espera um `HEAD` limpo do módulo | Commit, stash ou descarte mudanças locais do módulo |
| Root tem mudanças não relacionadas durante import | Reconciliação do root seria ambígua | Commit ou stash o trabalho não relacionado no root primeiro |
| Ref de módulo rastreada pelo root não é ancestral do `HEAD` do módulo | Histórico pode ter sido reescrito | Inspecione o histórico do módulo manualmente |

---

## 10. Fluxos Típicos

### Atualização de Módulo Disparada pelo Root

1. Edite arquivos dentro de `tessy-antigravity-rabelus-lab/`.
2. Commite a mudança de orquestração no root.
3. Deixe o hook rodar ou chame o script outbound manualmente.
4. Confirme que o repo do módulo recebeu um commit e push.
5. Se o root agora mostra uma atualização de ponteiro de módulo, rode o import script ou faça stage da entrada do módulo manualmente.
6. Commite a reconciliação do root.

### Atualização Iniciada no Módulo

1. Trabalhe dentro de `inception-v2/` diretamente.
2. Commite e faça push dentro do repo do módulo.
3. Rode o comando de status no root.
4. Rode `import-module-changes.ps1 -Module inception-v2 -DryRun`.
5. Rode o mesmo comando sem dry-run se o preview estiver seguro.
6. Revise e commite a reconciliação do lado do root.

---

## 11. Troubleshooting

### "Remote mismatch"

O script encontrou um `origin` que não corresponde ao `scripts/sync/sync.config.json`.

Corrija o remote do módulo ou atualize o contrato rastreado deliberadamente.

### "Module is behind upstream"

A branch local do módulo deve ser atualizada antes do sync outbound.

Resolva de dentro do repo do módulo primeiro.

### "Root has unrelated changes"

O caminho de import é intencionalmente estreito.

Limpe ou faça stash de mudanças não relacionadas no root para que a reconciliação do módulo seja revisável.

### "No modules require outbound sync"

O script outbound age somente em repos de módulo configurados com sujeira local.

Se esperava trabalho, rode o script de status e inspecione o repositório do módulo diretamente.

### "No inbound reconciliation required"

A referência de módulo rastreada pelo root já corresponde ao `HEAD` do módulo.

Não há nada para fazer stage no root para aquele módulo.

---

## 12. Expectativas do Dry-Run

Todo script de mutação suporta `-DryRun`.

O modo dry-run deve informar:

- Qual módulo seria afetado
- Qual remote seria usado
- Qual mensagem de commit seria gerada
- Qual passo de reconciliação do root seguiria
- Por que a operação está bloqueada, se não puder prosseguir

Se o output do dry-run for vago, trate isso como um defeito.

---

## 13. Verificação

Use o smoke harness local após mudar o comportamento do sync:

```powershell
pwsh -File scripts/sync/test-superproject-sync.ps1
```

O harness cobre:

- Comando de status em um fixture limpo
- Dry-run outbound
- Commit e push real outbound
- Dry-run e stage real inbound
- Um cenário de behind-upstream bloqueado

---

## 14. Mapa de Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `README.md` | Resumo público |
| `AGENTS.md` | Contrato para agentes de IA |
| `scripts/sync/sync.config.json` | Mapeamento rastreado root/módulo |
| `scripts/sync/install-superproject-sync.ps1` | Installer de bootstrap |
| `scripts/sync/superproject-sync-status.ps1` | Superfície de status |
| `scripts/sync/superproject-sync.ps1` | Engine outbound |
| `scripts/sync/import-module-changes.ps1` | Reconciliação inbound manual |
| `scripts/sync/test-superproject-sync.ps1` | Harness de regressão |

---

## 15. Regras Finais

Não ignore o comando de status quando o workspace parecer ambíguo.

Não ensine a futuros operadores um caminho oculto que pula os scripts rastreados.

Não normalize estados bloqueados.

Um sync bloqueado é mais seguro do que um sync não revisável.

---

---

# Sync Runbook — English Reference

> English technical reference for the Rabelus Superproject sync contract.  
> Full operator documentation is in the Portuguese section above.

## Vocabulary

- **Superproject:** Root at `E:\tessy-argenta-fenix` — orchestration, planning, sync tooling.
- **Module:** One of three embedded L1 repos (`tessy-antigravity-rabelus-lab`, `inception-v2`, `inception-tui`), each with its own `.git/` and GitHub remote.
- **Outbound Sync:** Root-triggered operation — commits and pushes module-local changes from inside the module repository.
- **Inbound Reconciliation:** Manual root-side operation — stages the updated embedded-repo entry after module history has moved.
- **Blocked State:** Tooling refuses to mutate anything. Operator must resolve ambiguity first.

## Safety Rules

Never force sync through ambiguous state. Never auto-merge root and module histories. Always use `-DryRun` before the first live run on a new machine.

## Block Conditions

Missing remote · Remote mismatch · Module behind upstream · Module diverged · Dirty module during import · Unrelated root changes during import · Non-ancestor module ref.

---

*Criado: 2026-04-23 · Atualizado: 2026-04-27*
