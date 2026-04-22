# MISSION BRIEFING
## Missao de Programa: TDP Platform Hardening + Voice Pipeline

**Mission ID:** `tdp-platform-hardening-voice-2026-03`  
**Tipo:** `MISSAO_DE_PROGRAMA`  
**Status:** `AGUARDANDO_EXECUCAO`  
**Criado em:** `2026-03-08`  
**Auditor:** `Codex GPT-5`  
**Executor previsto:** `Codex GPT-5`

---

## 1. CONTEXTO

Esta missao nasce de uma reauditoria profunda do repositorio apos a rodada de
implementacoes executada em 2026-03-07. O estado atual do aplicativo melhorou
materialmente, mas ainda apresenta riscos estruturais em seguranca,
persistencia, consistencia de estado, disciplina de release, autodocumentacao e
pipeline de entrada por voz.

O objetivo nao e apenas corrigir bugs isolados. O objetivo e reestruturar a
base em torno do novo `Tessy Dev Protocol`, tornando a Tessy mais coerente,
mais segura, mais auditavel e mais confiavel como plataforma local-first de
desenvolvimento assistido por IA.

---

## 2. ESCOPO

### 2.1 Incluido
- registrar formalmente o `Tessy Dev Protocol`;
- endurecer a superficie do terminal backend;
- tornar `GitHubProvider` reativo ao projeto ativo;
- resolver `ProjectDocService` com base documental real;
- implementar cofre de segredos com modo transparente e modo forte com senha do
  usuario;
- corrigir persistencia e renderizacao de wallpapers customizados;
- subir AutoDoc para pipeline com worker e armazenamento documental real;
- expandir fontes documentais oficiais relevantes;
- implementar STT no input de prompt;
- implementar reorganizacao semantica leve do prompt para melhorar inferencia;
- normalizar versao, docs e sinais de release do app.

### 2.2 Excluido
- push automatico;
- rollout externo;
- remocao de funcionalidades sem consulta;
- refatoracao estetica ampla sem relacao com o escopo;
- troca de provedor principal de inferencia sem necessidade tecnica.

---

## 3. OBJETIVOS

### O1. Seguranca operacional
Reduzir o risco do terminal e tornar o modelo de segredo documentado e
controlavel.

### O2. Coerencia de estado
Garantir que troca de projeto reflita corretamente nos providers criticos.

### O3. Persistencia correta
Mover payloads pesados para armazenamento apropriado e eliminar duplicacao
desnecessaria.

### O4. Base documental real
Substituir simulacoes e fluxos frageis por uma camada documental confiavel,
indexavel e reutilizavel.

### O5. Entrada por voz util
Permitir ditado de prompts com STT e reorganizacao leve orientada a intencao.

### O6. Disciplina de release
Alinhar versao, changelog, README e sinais internos do produto.

---

## 4. ARQUITETURA RELEVANTE

### Frontend
- `App.tsx`
- `contexts/ChatContext.tsx`
- `contexts/GitHubContext.tsx`
- `contexts/VisualContext.tsx`
- `components/layout/CoPilotPanel.tsx`
- `components/modals/VisualSettingsModal.tsx`
- `components/layout/RealTerminal.tsx`

### Backend local
- `server/index.ts`

### Persistencia e seguranca
- `services/dbService.ts`
- `services/authProviders.ts`
- `services/cryptoService.ts`
- `services/workspaceService.ts`

### Autodoc e base documental
- `services/autoDocScheduler.ts`
- `services/projectDocService.ts`
- `types.ts`

### Release e metadados
- `package.json`
- `README.md`
- `CHANGELOG.md`
- `metadata.json`

---

## 5. METODOLOGIA APLICADA

Esta missao deve seguir:
- `TMP`: barramento, documentos e ciclo de vida;
- `TDP`: gates de engenharia, contratos e criterio de pronto;
- `TSP`: seguranca operacional e pratica de desenvolvimento seguro.

Regras adicionais desta missao:
- nao desfazer nada sem consulta ao operador;
- toda mudanca em armazenamento exige migracao explicita;
- toda mudanca em permissao exige revisao de superficie;
- toda feature de IA deve declarar entrada, transformacao e saida;
- toda feature nova deve fechar com validacao e atualizacao documental.

---

## 6. CRITERIOS DE ACEITE

- `npx tsc --noEmit` passa ao final da missao;
- `.agent/TESSY_DEV_PROTOCOL.md` existe e esta integrado ao barramento;
- `GitHubProvider` segue o projeto ativo corretamente;
- o terminal local foi endurecido sem quebrar o uso previsto;
- o cofre suporta modo transparente e modo forte com senha do usuario;
- wallpapers customizados voltam a aparecer e nao duplicam payload pesado em
  `localStorage`;
- a base AutoDoc usa worker e armazenamento documental real;
- `ProjectDocService` usa schema coerente e fonte documental real;
- STT funciona no input de prompt com organizacao leve de intencao;
- `metadata.json` deixa de carregar permissao sobrando;
- versao e release metadata ficam coerentes em todo o app;
- changelog e docs finais refletem o estado real da entrega.

---

## 7. DECISOES DO OPERADOR JA APROVADAS

- hardening do terminal: aprovado;
- correcoes de provider e estado: aprovado;
- `ProjectDocService`: aprovado resolver;
- cofre com dois modos: aprovado;
- correcao de wallpaper customizado: aprovado;
- normalizacao de versao e release metadata: aprovado;
- base documental real com worker: aprovado;
- STT no prompt com uso de Gemini: aprovado;
- manter microfone apenas se houver uso justificado por STT: aprovado.

---

## 8. DECISOES QUE AINDA PODEM EXIGIR CONSULTA

- se o modo forte de segredo passa a ser o padrao para novos tokens ou se fica
  apenas opt-in;
- se o STT deve ter fallback local/browser alem de Gemini;
- se transcricao final enviada deve ou nao ficar persistida separadamente;
- se a ampliacao de fontes documentais deve ficar restrita ao pacote oficial
  inicial ou incluir integracoes extras de maior custo.

---

## 9. RISCOS INICIAIS

### R1. Seguranca
Hardening do terminal pode introduzir regressao de conexao ou handshake se for
feito sem compatibilizacao cuidadosa.

### R2. Persistencia
Migracoes de wallpaper, cofre e documentacao podem deixar lixo legado ou dados
sem leitura se o caminho de compatibilidade nao for bem tratado.

### R3. UX
STT e reorganizacao semantica podem soar "invasivos" se a intencao do usuario
nao ficar claramente preservada.

### R4. Arquitetura
Introduzir worker e base documental sem schema claro pode apenas deslocar a
fragilidade em vez de resolvela.

---

## 10. SKILL DISCOVERY E REFERENCIAS

### Skills locais
Nao ha skill especifica da Tessy registrada neste repositorio para este
programa. Se surgir necessidade de criar skill reutilizavel do protocolo ou do
pipeline documental, considerar uso futuro de `skill-creator`.

### Referencias externas previstas
- Gemini API docs para STT/TTS e modelos multimodais
- Web Worker e Web Speech/Web Audio docs
- MDN para MediaRecorder, getUserMedia e IndexedDB
- documentacao oficial de bibliotecas adicionadas, se aprovadas

### Sequencia operacional
1. Registrar protocolo e missao
2. Fazer pre-flight
3. Executar grupos A -> B -> C -> D -> E -> F -> Z
4. Validar gates
5. Entregar relatorio final

---

## 11. DEFINICAO DE SUCESSO

Esta missao sera considerada bem-sucedida se a Tessy terminar mais segura, mais
coerente e mais explicita em seus contratos internos, sem regressao silenciosa
do comportamento atual e com rastro documental suficiente para auditoria
futura.
