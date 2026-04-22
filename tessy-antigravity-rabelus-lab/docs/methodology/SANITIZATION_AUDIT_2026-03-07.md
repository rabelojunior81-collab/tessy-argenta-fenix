# Sanitization Audit - 2026-03-07

## Escopo

Varredura estática do repositório com foco em:

- placeholders;
- stubs e mocks;
- fluxos parcialmente implementados;
- componentes legados;
- artefatos órfãos ou sem governança explícita;
- inconsistências entre método, código e documentação.

## Achados críticos

### 1. Terminal com `cwd` real exigia autoridade fora do browser

Status: `RESOLVIDO`

O problema estrutural foi fechado com um broker local que registra `workspaceId -> absolutePath`, valida a workspace real e cria a sessão PTY já no `cwd` correto.

Residual:

- o primeiro ciclo usa registro explícito de path absoluto pelo operador;
- um picker nativo futuro ainda pode melhorar a ergonomia.

### 2. Renomeio de pasta continua não implementado

Status: `PARCIAL`

Em [contexts/WorkspaceContext.tsx](/E:/conecta/tessy-antigravity-rabelus-lab/contexts/WorkspaceContext.tsx) o rename de diretório segue retornando erro funcional. O wiring do explorer foi corrigido, mas a operação não existe de fato.

Encaminhamento:

- implementar rename transacional de diretório via cópia estruturada;
- ou esconder a opção até a operação ser real.

### 3. Componentes legados de autenticação ainda coexistem

Status: `RISCO ACEITO`

`AuthPanel` é a central atual, mas `GitHubTokenModal` ainda existe. Isso aumenta superfície de drift de UX e de política de armazenamento.

Encaminhamento:

- consolidar a UX em uma única central;
- manter o modal legado apenas enquanto houver dependência explícita mapeada.

## Achados relevantes

### 4. Artefatos não rastreados e ruído de worktree

Status: `PARCIAL`

Há artefatos não rastreados que precisam de decisão:

- `.claude/` foi arquivada em `docs/legacy-data/claude/`
- `nul`
- docs avulsos já relevantes

Encaminhamento:

- classificar o que vira journal oficial;
- ignorar ou remover o que for ruído operacional;
- nunca apagar sem decisão explícita.

### 5. AutoDoc ficou real, mas ainda depende de CORS e markup externo

Status: `PARCIAL`

O pipeline saiu do stub e já possui worker, indexação e base documental local. O risco agora mudou de estágio:

- coleta web continua sensível a CORS;
- extração depende de estrutura HTML de terceiros;
- precisa de telemetria local melhor para falhas de fonte.

Encaminhamento:

- priorizar fontes oficiais estáveis;
- adicionar metadados de origem, data e confiança por documento;
- ampliar fallback para ingestão manual ou por arquivo.

### 6. Wallpaper customizado exigia aplicação visual robusta

Status: `RESOLVIDO`

O bug de renderização estava no acoplamento entre variável CSS e imagem customizada. A aplicação passou a usar URL resolvida diretamente no layer visual, com fallback seguro.

### 7. STT precisava de observabilidade local

Status: `RESOLVIDO`

Foi necessário introduzir feedback de gravação, processamento e descarte automático dos marcadores quando o usuário volta a editar o texto manualmente.

### 8. Explorer expandido por padrão piorava navegação profunda

Status: `RESOLVIDO`

O explorer agora inicia recolhido, o que reduz atrito em árvores grandes.

## Backlog recomendado

Prioridade alta:

- broker local para terminal com `cwd` real;
- rename real de diretório;
- saneamento de componentes legados de auth;
- política formal para artefatos não rastreados.

Prioridade média:

- ampliar observabilidade do AutoDoc;
- consolidar taxonomy de documentação e journal;
- revisar permissões remanescentes e mensagens de erro de fallback.

Prioridade estrutural:

- migrar de “projeto com docs” para “produto com canon e memória institucional”.
