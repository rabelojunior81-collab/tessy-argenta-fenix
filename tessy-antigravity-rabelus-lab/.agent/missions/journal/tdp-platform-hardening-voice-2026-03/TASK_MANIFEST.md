# TASK MANIFEST
## Missao: tdp-platform-hardening-voice-2026-03

---

## GRUPO A - PROTOCOLO E BARRAMENTO

### TASK-A1
**Titulo:** Registrar Tessy Dev Protocol  
**Objetivo:** Formalizar a metodologia TDP no repositorio  
**Arquivos-alvo:** `.agent/TESSY_DEV_PROTOCOL.md`, `.agent/MISSION_PROTOCOL.md`  
**Criterio de aceite:** TDP criado e referenciado pelo protocolo raiz  
**Dependencias:** nenhuma  
**Risco:** baixo  
**Commit sugerido:** `TSP: [TASK-A1] Registra Tessy Dev Protocol`

### TASK-A2
**Titulo:** Abrir missao de programa  
**Objetivo:** Registrar briefing, manifest, protocolo e report da missao ativa  
**Arquivos-alvo:** `.agent/missions/tdp-platform-hardening-voice-2026-03/*`  
**Criterio de aceite:** quatro documentos criados e consistentes  
**Dependencias:** `TASK-A1`  
**Risco:** baixo  
**Commit sugerido:** `TSP: [TASK-A2] Abre missao de programa`

---

## GRUPO B - SEGURANCA CRITICA

### TASK-B1
**Titulo:** Endurecer terminal local  
**Objetivo:** Reduzir a superficie do backend PTY sem quebrar o uso local previsto  
**Arquivos-alvo:** `server/index.ts`, componentes clientes do terminal  
**Criterio de aceite:** origem, handshake e escopo local controlados  
**Dependencias:** `TASK-A1`, `TASK-A2`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-B1] Endurece terminal local`

### TASK-B2
**Titulo:** Implementar cofre em dois modos  
**Objetivo:** Suportar modo transparente e modo forte com senha do usuario  
**Arquivos-alvo:** `services/cryptoService.ts`, `services/authProviders.ts`, UI relacionada  
**Criterio de aceite:** ambos os modos funcionam com migracao e fallback  
**Dependencias:** `TASK-A1`, `TASK-A2`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-B2] Implementa cofre com modo forte`

---

## GRUPO C - CONSISTENCIA DE ESTADO E PERSISTENCIA

### TASK-C1
**Titulo:** Tornar GitHubProvider reativo  
**Objetivo:** Sincronizar provider com o projeto ativo da interface  
**Arquivos-alvo:** `contexts/GitHubContext.tsx`, `App.tsx`, tipos relacionados  
**Criterio de aceite:** troca de projeto atualiza o provider sem stale state  
**Dependencias:** `TASK-A2`  
**Risco:** medio  
**Commit sugerido:** `TSP: [TASK-C1] Sincroniza GitHubProvider com projeto ativo`

### TASK-C2
**Titulo:** Corrigir wallpaper customizado  
**Objetivo:** Restaurar visibilidade e persistencia correta sem payload pesado em localStorage  
**Arquivos-alvo:** `contexts/VisualContext.tsx`, `components/modals/VisualSettingsModal.tsx`, schema local  
**Criterio de aceite:** imagem aparece, persiste e nao duplica `dataUrl` pesado  
**Dependencias:** `TASK-A2`  
**Risco:** medio  
**Commit sugerido:** `TSP: [TASK-C2] Normaliza wallpapers customizados`

---

## GRUPO D - BASE DOCUMENTAL REAL

### TASK-D1
**Titulo:** Subir pipeline documental para worker  
**Objetivo:** Tirar processamento principal do AutoDoc e criar fluxo confiavel em worker  
**Arquivos-alvo:** `services/autoDocScheduler.ts`, worker novo, wiring no app  
**Criterio de aceite:** coleta/processamento documental ocorre em worker com status rastreavel  
**Dependencias:** `TASK-A2`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-D1] Move pipeline documental para worker`

### TASK-D2
**Titulo:** Estruturar banco documental real  
**Objetivo:** Criar schema/indexes e armazenamento reutilizavel para documentos coletados  
**Arquivos-alvo:** `services/dbService.ts`, `types.ts`, camada documental nova  
**Criterio de aceite:** store documental com schema versionado e consultas coerentes  
**Dependencias:** `TASK-D1`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-D2] Cria base documental local`

### TASK-D3
**Titulo:** Resolver ProjectDocService  
**Objetivo:** Conectar geracao e consulta documental ao banco real e corrigir schema de templates  
**Arquivos-alvo:** `services/projectDocService.ts`, `types.ts`, `services/dbService.ts`  
**Criterio de aceite:** consultas nao dependem de campo/index inexistente e API docs deixam de ser placeholder cru  
**Dependencias:** `TASK-D2`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-D3] Reestrutura ProjectDocService`

### TASK-D4
**Titulo:** Expandir fontes oficiais relevantes  
**Objetivo:** Registrar e suportar fontes documentais oficiais para libs e stacks do app  
**Arquivos-alvo:** camada documental, docs de suporte, configuracoes relacionadas  
**Criterio de aceite:** pacote inicial de fontes relevantes definido e suportado  
**Dependencias:** `TASK-D2`  
**Risco:** medio  
**Commit sugerido:** `TSP: [TASK-D4] Expande fontes documentais oficiais`

---

## GRUPO E - VOICE INPUT E PIPELINE DE PROMPT

### TASK-E1
**Titulo:** Normalizar permissao de microfone  
**Objetivo:** Manter permissao apenas onde houver uso real e explicito  
**Arquivos-alvo:** `metadata.json`, componentes de captura, docs da feature  
**Criterio de aceite:** permissao deixa de ser sobra e passa a refletir feature real  
**Dependencias:** `TASK-A2`  
**Risco:** medio  
**Commit sugerido:** `TSP: [TASK-E1] Normaliza permissao de microfone`

### TASK-E2
**Titulo:** Implementar STT no input  
**Objetivo:** Permitir ditado de prompts no fluxo principal do input  
**Arquivos-alvo:** componentes do input/copilot, services Gemini relacionados  
**Criterio de aceite:** usuario consegue gravar, transcrever e inserir texto no prompt  
**Dependencias:** `TASK-E1`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-E2] Implementa STT no prompt`

### TASK-E3
**Titulo:** Organizar prompt sem trair intencao  
**Objetivo:** Aplicar reorganizacao leve da transcricao para melhorar inferencia  
**Arquivos-alvo:** pipeline do input, services IA, UX de confirmacao  
**Criterio de aceite:** texto fica mais estruturado sem alterar significado central  
**Dependencias:** `TASK-E2`  
**Risco:** alto  
**Commit sugerido:** `TSP: [TASK-E3] Organiza prompts por intencao`

---

## GRUPO F - RELEASE DISCIPLINE

### TASK-F1
**Titulo:** Normalizar versao e sinais de release  
**Objetivo:** Alinhar package, README, changelog, footer, metadata e textos do produto  
**Arquivos-alvo:** `package.json`, `README.md`, `CHANGELOG.md`, `App.tsx`, docs correlatas  
**Criterio de aceite:** nao ha drift de versao nos pontos oficiais do produto  
**Dependencias:** `TASK-D3`, `TASK-E3`  
**Risco:** baixo  
**Commit sugerido:** `TSP: [TASK-F1] Normaliza versao e release metadata`

---

## GRUPO Z - FECHAMENTO

### TASK-Z1
**Titulo:** Atualizar documentacao viva  
**Objetivo:** Refletir mudancas estruturais em docs permanentes e de missao  
**Arquivos-alvo:** docs tecnicas, barramento, report da missao  
**Criterio de aceite:** documentacao final coerente com implementacao  
**Dependencias:** `TASK-F1`  
**Risco:** baixo  
**Commit sugerido:** `TSP: [TASK-Z1] Atualiza documentacao viva`

### TASK-Z2
**Titulo:** Fechar changelog  
**Objetivo:** Registrar entrega real da missao  
**Arquivos-alvo:** `CHANGELOG.md`  
**Criterio de aceite:** changelog reflete a missao em estado final  
**Dependencias:** `TASK-Z1`  
**Risco:** baixo  
**Commit sugerido:** `TSP: [TASK-Z2] Fecha changelog da missao`

### TASK-Z3
**Titulo:** Auditoria final e validacao  
**Objetivo:** Executar gates finais e consolidar declaracao de entrega  
**Arquivos-alvo:** `REPORT_TEMPLATE.md`  
**Criterio de aceite:** gates executados e entrega declarada  
**Dependencias:** `TASK-Z2`  
**Risco:** medio  
**Commit sugerido:** `TSP: [TASK-Z3] Consolida entrega da missao`
