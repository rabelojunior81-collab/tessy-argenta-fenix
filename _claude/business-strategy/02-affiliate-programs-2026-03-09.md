# DOCUMENTO 02 — PROGRAMAS DE AFILIADOS
## Tessy — Receita Passiva Imediata via LLM Providers e Ecossistema
**Data:** 2026-03-09
**Série:** Estratégia de Negócio Tessy / Rabelus Lab

---

## PREMISSA

Affiliate marketing é a **única estratégia que gera receita antes de ter produto pago**. Para Tessy, o contexto é ainda mais favorável: os usuários de Tessy são exatamente quem os grandes LLM providers e ferramentas de dev querem alcançar — e vão pagar para chegar neles.

**Princípio central:** Não monetizar a ferramenta ainda. Monetizar o acesso ao usuário.

**Estimate conservador:** 100 usuários ativos, 30% convertendo em compras via affiliate → R$1.500-3.000/mês de receita passiva sem nenhum esforço técnico adicional.

---

## MAPA DE OPORTUNIDADES DE AFILIADO

### Tier 1 — Alta Relevância + Programa Ativo Confirmado

#### 1.1 OpenRouter

**O que é:** API unificada para 200+ modelos LLM. Um endpoint, todos os providers.

**Por que é perfeito para Tessy:**
- Tessy hoje usa Gemini exclusivamente — lock-in real
- OpenRouter resolve isso: usuário coloca uma chave, acessa Claude, GPT-4, Gemini, Mistral, tudo
- O usuário de Tessy PRECISA do OpenRouter para ter liberdade de modelos

**Programa de afiliados:**
- OpenRouter tem programa ativo com comissão sobre créditos comprados
- Estrutura: usuário se cadastra via link Tessy → compra créditos → Tessy recebe %
- URL do programa: openrouter.ai/affiliates (verificar condições atuais)

**Como integrar sem código:**
1. Link de afiliado no README, docs e dentro da própria UI do Tessy ("Configure seu LLM provider")
2. Post de conteúdo: "Como usar qualquer modelo de IA no Tessy com OpenRouter"
3. Quando usuário vai adicionar chave Gemini, mostrar banner: "Prefere acesso a 200+ modelos? Use OpenRouter →"

**Potencial mensal:** USD 50-500 dependendo do volume de usuários convertidos

---

#### 1.2 Anthropic Console (Claude API)

**O que é:** Acesso direto à API do Claude (Opus, Sonnet, Haiku).

**Por que é relevante para Tessy:**
- Claude é o modelo mais competente para raciocínio e código complexo
- Usuários de Tessy que quiserem usar Claude Opus via Tessy precisam de chave da API
- Posicionamento: "Use Claude dentro do Tessy"

**Programa de afiliados:**
- Anthropic tem programa de referral para console.anthropic.com
- Condições: créditos de API para quem converte via link
- Verificar: console.anthropic.com/referral ou programa de parceiros

**Como integrar:**
1. "Tessy recomenda Claude Opus para tarefas de raciocínio profundo"
2. Link direto no modal de configuração de providers (quando multi-provider for implementado)
3. Conteúdo: "Qual modelo usar para cada tarefa? Guia Tessy"

---

#### 1.3 Google AI Studio / Gemini API

**O que é:** Acesso à API Gemini — já é o provider atual do Tessy.

**Por que é relevante:**
- Tessy já usa Gemini — é a conversão mais natural
- Google tem programa de referral para AI Studio
- Usuários novos que não têm chave Gemini vêm via Tessy

**Como integrar:**
1. No onboarding do Tessy: "Não tem chave Gemini? Crie sua conta aqui →" (link afiliado)
2. Tutorial: "Configurando Tessy do zero — criando sua API key Gemini"

---

### Tier 2 — Alta Relevância, Programa em Verificação

#### 2.1 Kilo Gateway / Kilo Code Subscriptions

**O que é:** Gateway LLM com subscription mensal — alternativa ao "pagar por token". Usuário paga mensalmente e tem acesso a um envelope de tokens.

**Por que é estratégico para Tessy:**
- O usuário de Tessy que mais sofre é o que tem medo de gastar sem controle
- Kilo resolve: preço fixo mensal, sem surpresa no final do mês
- "Tessy + Kilo = custo previsível de IA" — mensagem clara

**Modelo de parceria potencial:**
- Afiliado simples: link para assinar Kilo via Tessy
- **Reseller / Bundle**: "Tessy Indie inclui X créditos Kilo/mês" — Tessy compra wholesale, revende embutido no plano
- Contato: identificar time de parcerias Kilo (kilocode.ai ou kilo.ai — verificar URL atual)

**Ação imediata:** Entrar em contato com Kilo para proposta de parceria/reseller antes de lançar afiliado simples. O bundle é mais lucrativo.

---

#### 2.2 Minimax API

**O que é:** Provider LLM multimodal chinês — text, voice, video. Especialmente forte em STT/TTS.

**Por que é relevante para Tessy:**
- Tessy já tem voice STT via Gemini
- Minimax oferece STT/TTS de qualidade com custo competitivo
- Alternativa para usuários fora do ecossistema Google
- Programa de afiliados internacional

**Ação:** Verificar programa de parceiros em minimax.io/en/platform

---

#### 2.3 Z.ai (01.AI / Yi Models)

**O que é:** Infraestrutura de AI inference — modelos Yi de alta performance a custo baixo.

**Por que é relevante:**
- Alternativa de baixo custo para usuários que precisam de volume
- "Para processar grandes volumes de texto, Z.ai via Tessy custa X% menos"
- Programa de afiliados a verificar

---

### Tier 3 — Ferramentas Adjacentes (não-LLM mas relevantes)

#### 3.1 GitHub (GitHub Copilot Individual)

**O que é:** Autocompletar IA no editor — diferente do Tessy, mas complementar.

**Oportunidade:** Usuário de Tessy usa GitHub — pode também usar Copilot para autocomplete no VS Code. Link de afiliado para GitHub Copilot (programa ativo via GitHub Partners).

---

#### 3.2 Vercel (Hosting)

**O que é:** Plataforma de deploy frontend mais usada por indie makers.

**Oportunidade:** Usuário constrói algo com Tessy → precisa fazer deploy → Vercel é a escolha natural. Vercel tem programa de afiliados/parceiros.

---

#### 3.3 Supabase

**O que é:** Backend-as-a-Service open source (Postgres + Auth + Storage).

**Oportunidade:** Indie maker que usa Tessy para construir um SaaS vai precisar de backend. Supabase tem programa de afiliados.

---

#### 3.4 Railway / Render

**O que é:** Plataforma de deploy para backends (Node.js, Docker, etc.).

**Oportunidade:** O broker Express do Tessy pode ser hospedado no Railway. E qualquer backend que o usuário construir com Tessy vai para Railway/Render.

---

## IMPLEMENTAÇÃO DO STACK DE AFILIADOS

### Sem código (imediato — semana 1)

| Ação | Onde | Esforço |
|------|------|---------|
| Links de afiliado no README.md | GitHub repo | 1h |
| Links na documentação/wiki | GitHub wiki | 2h |
| Links no Discord/comunidade da Tessy | Bio e posts fixos | 30min |
| Links no Twitter/X e LinkedIn (bio) | Redes sociais | 30min |
| Página de "Ferramentas que usamos" no site | Site futuro | — |

### Com pouco código (semana 2-4)

| Ação | Como | Esforço |
|------|------|---------|
| Banner no onboarding "Ainda não tem API key?" | Modal de auth | 2h |
| Tooltip nas configurações de provider | Config UI | 3h |
| Página `/ferramentas` estática no site | HTML simples | 4h |

---

## ESTRATÉGIA DE CONTEÚDO PARA AFILIADOS

O conteúdo que converte melhor não é "clique no meu link afiliado". É conteúdo genuinamente útil que naturalmente inclui os links.

### Posts de alto potencial de conversão

| Título | Link afiliado natural | Formato |
|--------|----------------------|---------|
| "Como usar Claude, GPT-4 e Gemini no mesmo projeto" | OpenRouter | Tutorial |
| "Quanto custa realmente usar IA para desenvolvimento?" | OpenRouter + Kilo | Comparativo |
| "Configurando Tessy do zero em 10 minutos" | Gemini API, OpenRouter | Tutorial |
| "Os melhores modelos para cada tipo de tarefa de código" | OpenRouter + Anthropic | Guia |
| "Deploy do seu projeto feito com Tessy no Vercel" | Vercel | Tutorial |
| "Como evitar surpresas na fatura de API da IA" | Kilo | Educativo |

---

## MODELO DE RASTREAMENTO

Criar planilha simples para rastrear:

```
| Provider    | Programa    | Link ativo | Conversões/mês | Receita/mês |
|-------------|-------------|------------|----------------|-------------|
| OpenRouter  | affiliate   | sim/não    | X              | R$X         |
| Anthropic   | referral    | sim/não    | X              | R$X         |
| Gemini API  | partner     | sim/não    | X              | R$X         |
| Kilo        | reseller    | sim/não    | X              | R$X         |
| Vercel      | affiliate   | sim/não    | X              | R$X         |
| Supabase    | affiliate   | sim/não    | X              | R$X         |
```

Atualizar mensalmente. Dobrar esforço nos que convertem mais.

---

## PRÓXIMOS PASSOS IMEDIATOS

| Prioridade | Ação | Responsável | Prazo |
|-----------|------|-------------|-------|
| 1 | Cadastrar no programa OpenRouter affiliates | Adilson | Semana 1 |
| 2 | Verificar programa Anthropic referral | Adilson | Semana 1 |
| 3 | Adicionar links afiliados no README do repo | Agente técnico | Semana 1 |
| 4 | Entrar em contato com Kilo para parceria | Adilson | Semana 2 |
| 5 | Criar primeiro post de conteúdo com link afiliado | Adilson | Semana 2 |
| 6 | Verificar Minimax e Z.ai programs | Adilson | Semana 3 |

---

## ESTIMATIVA DE RECEITA (CONSERVADORA)

| Cenário | Usuários ativos | Taxa conversão | Receita/mês |
|---------|----------------|----------------|-------------|
| Mês 1 | 20 | 10% | R$100-200 |
| Mês 3 | 100 | 15% | R$500-1.000 |
| Mês 6 | 300 | 20% | R$1.500-3.000 |
| Mês 12 | 500 | 25% | R$3.000-6.000 |

*Esta receita é ADICIONAL à receita de subscription. É o piso, não o teto.*

---

*Documento 02/07 — Série Estratégia de Negócio Tessy*
*Data: 2026-03-09 | Tessy — Rabelus Lab — Argenta Fenix Initiative*
