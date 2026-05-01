# Open WebUI - Auditoria de Arquitetura e Engenharia Reversa (Síntese)

**Data:** 2026-04-30
**Fase Alvo:** 4.1 (Tessy AI)
**Repositório Base:** `research-repos/open-webui/`

## Objetivo
Análise profunda executada holisticamente pelo Agente Antigravity para embasar as decisões de arquitetura da Tessy.

## Entregas Concluídas (Docs Locais)
* [x] `streaming-chat.md`: Mapeia FastAPI `StreamingResponse` e Svelte SSE.
* [x] `providers-models.md`: Mapeia abstração multi-provider e failovers.
* [x] `context-rag.md`: Mapeia integração vetorial, persistência e chunking.
* [x] `tools-workflows.md`: Mapeia interceptação de Function Calling.
* [x] `holistic-extras.md`: Mapeia iFrames de Artifacts e Build Docker unificado.

## Conclusões Aplicáveis à Tessy (Arquitetura Proposta)
1. **Unificação de Serviço:** Adotar o padrão do Open WebUI de servir a build final estática do frontend (SPA) através do mesmo backend Python que lida com o LLM (via FastAPI mount). Isso unifica a porta de desenvolvimento.
2. **Streaming Ininterrupto:** Implementar o loop do `event_generator()` com pausas automáticas para execução isolada de *Tools*. O frontend deve estar preparado para receber um sinal de "executando função local" via SSE.
3. **Artifacts na Tessy:** Desenvolver um visualizador encapsulado via `iframe` (sandbox) para as saídas HTML da Tessy, exatamente como o paradigma de Canvas do Open WebUI.
4. **Tool Hooks:** Criar a camada de `pipelines.py` onde nossos comandos GSD podem ser acoplados como "Functions" automáticas dentro do contexto do Chat.

**Próximo Passo no Workflow GSD:** Com a auditoria concluída, estamos aptos a rodar o `/gsd-plan-phase 4.1` com domínio arquitetural total.
