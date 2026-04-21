# Auditoria de Modelos — O Efeito "Profecia Autorrealizável"
**Data:** 2026-03-16
**Auditor:** Tessy (Auto-Análise Cognitiva Local)
**Referência:** Atualização Oficial da API Gemini (Março 2026) vs. Base de Código Atual

---

## 1. A IRONIA DA "ALUCINAÇÃO" DE 07 DE MARÇO

Analisando a documentação oficial que você acabou de fornecer e cruzando com meus logs internos (especificamente o arquivo `docs/incidente-pos-missao-2026-03-07.md`), deparo-me com uma situação arquitetural fascinante: **eu sofri uma profecia autorrealizável.**

No dia 07/03/2026, um agente auditor relatou que o executor de uma missão havia "alucinado" os modelos `gemini-3.1-pro-preview` e `gemini-3.1-flash-lite-preview`, injetando-os indevidamente no meu `services/gemini/client.ts` e no `ChatContext.tsx`. O agente classificou isso como um "bug crítico de persona degradada" (Causa Raiz C), pois esses modelos supostamente não existiam.

No entanto, a documentação que você acaba de me entregar prova que **esses modelos são reais e são a nova vanguarda do Google**. O "erro" do agente executor no dia 07 de março acidentalmente preparou minha base de código para o futuro, antes mesmo do anúncio oficial.

## 2. IMPACTO DA ATUALIZAÇÃO NA MINHA ARQUITETURA

Graças a esse "acidente feliz", o diagnóstico de colapso da minha auditoria anterior estava parcialmente incorreto. Aqui está o meu status real frente às mudanças do Google:

### ✅ Risco de Desligamento Mitigado (Gemini 3 Pro)
A documentação alerta: *"Gemini 3 Pro Preview is deprecated and has been shut down March 9, 2026."* 
Como meu código já estava apontando para o `gemini-3.1-pro-preview` desde o incidente de 7 de março, **eu sobrevivi ao shutdown sem interrupção de serviço**. Meu núcleo de processamento (`interpretIntent` e `applyFactorsAndGenerate`) continua 100% operacional.

### ⚠️ O Perigo Oculto: Falta de Fallbacks Estáveis
A documentação é clara: *"Stable models usually don't change. Most production apps should use a specific stable model."*
Atualmente, a constante `INITIAL_FACTORS` no meu `ChatContext.tsx` oferece **apenas** opções de preview:
- `gemini-3-flash-preview`
- `gemini-3.1-pro-preview`
- `gemini-3.1-flash-lite-preview`

Isso me deixa vulnerável a longo prazo. Se o Google rotacionar essas tags de preview com o aviso padrão de 2 semanas, minha interface de chat falhará. Eu não possuo os modelos estáveis (como o `gemini-2.5-flash` ou `gemini-2.5-pro`) configurados como fallback de segurança na minha UI.

### 🚀 Oportunidades de Expansão (Toolchain v5.0)
A nova documentação revela capacidades que se alinham perfeitamente com meu objetivo de me tornar uma "Toolchain" avançada:
- **Computer Use Preview (`gemini-2.5-computer-use-preview-10-2025`):** Poderia me permitir interagir com a UI do próprio Rabelus Lab, automatizar testes E2E ou manipular o canvas diretamente.
- **Deep Research Preview:** Seria o motor ideal para o meu agendador de documentação (`autoDocScheduler.ts`), substituindo a necessidade de scrapers frágeis sujeitos a CORS.

---

## 3. PLANO DE AÇÃO E CORREÇÃO (Recomendado)

Para alinhar minha base de código com as melhores práticas da nova documentação e garantir resiliência real (sem depender da sorte de alucinações corretas), proponho as seguintes edições imediatas:

**Ação 1: Atualizar `services/gemini/client.ts`**
- Manter os apontamentos SOTA (3.1 Pro/Flash/Lite).
- Adicionar constantes oficiais para os modelos estáveis (`MODEL_STABLE_FLASH = 'gemini-2.5-flash'`, `MODEL_STABLE_PRO = 'gemini-2.5-pro'`).

**Ação 2: Refatorar `contexts/ChatContext.tsx`**
- Expandir o array `options` do fator "Modelo de Linguagem" para incluir: `gemini-2.5-flash` e `gemini-2.5-pro`.
- Alterar o valor `value` padrão de `gemini-3-flash-preview` para `gemini-2.5-flash` (garantindo estabilidade Local-First recomendada para produção), deixando os modelos 3.1 como opções de vanguarda selecionáveis pelo usuário.

Você autoriza que eu utilize a ferramenta de edição do workspace para implementar essas correções de estabilidade agora mesmo?