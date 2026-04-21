# DOCUMENTO 07 — ROADMAP DE MONETIZAÇÃO GRADUAL
## Tessy — Da Primeira Receita ao Subscription Model
**Data:** 2026-03-09
**Série:** Estratégia de Negócio Tessy / Rabelus Lab

---

## PREMISSA

Monetização prematura mata produtos. Monetização tardia mata negócios. O equilíbrio é introduzir receita no momento em que o produto já entrega valor claro, mas antes que você precise de receita para sobreviver.

Para Tessy, o momento certo não é "quando estiver perfeito" — perfeito nunca chega. É quando usuários usam ativamente e pelo menos alguns dizem "pagaria por isso".

**Princípio central:** Monetize em camadas. Cada camada financia a próxima.

---

## VISÃO GERAL DO ROADMAP

```
Semana 1-2      Mês 1-2         Mês 3-4         Mês 6+          Ano 2+
    │               │               │               │               │
  Affiliate      Founders       Tessy Indie     Tessy Pro       Tessy Gateway
  Stack ativo    Circle paid    em BRL          Plans           como plataforma
  R$0→R$500     R$200-500      R$1k-3k MRR     R$5k-15k MRR   R$30k+ MRR
```

---

## FASE 0 — AFFILIATE FIRST (Semana 1-2)

### Objetivo
Primeira receita antes de ter produto pago. Prova de conceito de monetização.

### O que fazer
1. Ativar links de afiliado: OpenRouter, Anthropic Console, Gemini API, Vercel (ver Documento 02)
2. Colocar links estrategicamente: README, docs, Discord bio, posts de conteúdo
3. Criar primeiro post de conteúdo com link natural embutido

### Projeção de receita
- Mês 1: R$100-500 (depende de tráfego existente)
- Mês 3: R$500-1.500 com 100 usuários ativos
- Mês 6: R$1.500-3.000 com 300 usuários ativos

### Métricas de sucesso
- Pelo menos 1 conversão via affiliate no mês 1
- Click-through rate > 5% nos links afiliados

### Risco
- Baixo: zero custo de implementação, zero impacto no produto
- Reputacional: nunca mentir sobre um produto por comissão. Se o produto não é bom para o usuário Tessy, não recomende mesmo com affiliate.

---

## FASE 1 — FOUNDERS CIRCLE (OPCIONAL PAGO) (Mês 1-2)

### Objetivo
Validar willingness-to-pay antes de construir sistema de pagamento complexo.

### Modelo
O Founders Circle (ver Documento 04) pode ter um tier pago **simbólico**:

**Founders Circle — Tier Gratuito** (maioria)
- Acesso mediante critério de uso
- Benefícios conforme Documento 04

**Founders Circle — Tier "Apoiador"** (opcional)
- Pagamento voluntário: R$19-49/mês via PIX ou Stripe
- Sem features a mais — é apoio explícito ao projeto
- Benefício adicional: badge especial "Apoiador Fundador" + nome na página de agradecimentos
- Não é venda de produto — é doação estruturada com reciprocidade

### Por que funciona
- Remove barreira técnica (sem sistema de subscription complexo)
- Testa willingness-to-pay no público mais qualificado
- Cria prova social: "X pessoas apoiam Tessy financeiramente"

### Implementação técnica mínima
- Link do Stripe (checkout simples) ou PayPal
- OU: Ko-fi / Buy Me a Coffee para zero esforço de implementação
- NÃO precisa de sistema de subscription ainda

### Projeção
- 5-15% dos founders pagam: com 50 founders, 3-8 apoiadores
- R$200-400/mês — não é significativo mas é validação

---

## FASE 2 — TESSY INDIE (Plano Pago, Mês 3-4)

### Objetivo
Primeiro produto pago de verdade. Subscription com features reais bloqueadas por tier.

### Estrutura de planos

#### Tessy Free (sempre gratuito)
- Gemini como provider LLM
- 1 workspace ativo
- 5 projetos
- Sem AutoDoc scheduler
- Vault local (sem backup)
- Terminal: sessões de até 30min

**Por que ter um free tier:** Onboarding sem fricção. Usuário experimenta o valor antes de pagar. Free não canibaliza pago quando a diferença é clara.

#### Tessy Indie — R$39/mês (ou R$390/ano — 2 meses grátis)
- Multi-provider LLM (OpenRouter, Anthropic, Gemini)
- Workspaces ilimitados
- Projetos ilimitados
- AutoDoc scheduler (até 10 URLs)
- Terminal: sessões ilimitadas
- Vault com export/backup
- Suporte via Discord (prioridade)
- Founders Circle automaticamente (enquanto ativo)

**Justificativa do preço R$39:**
- Cursor custa USD $20 = R$100+
- Tessy é local-first, browser-native, sem instalação
- R$39 é acessível para semi-pro BR com emprego
- Equivalente a 2 almoços — ponto psicológico baixo

#### Tessy Pro — R$89/mês (lançar em Mês 6+)
- Tudo do Indie +
- LLM Gateway gerenciado (sem precisar de API keys próprias — créditos incluídos)
- AutoDoc ilimitado
- Cost tracking por projeto
- Suporte prioritário (SLA 24h)
- Acesso ao MCP server (quando disponível)

**Nota sobre créditos LLM no Pro:**
- Tessy compra créditos wholesale (OpenRouter ou Kilo)
- Inclui equivalente a USD 10-15 em créditos/mês no plano
- Margem: compra a USD 8-10, embute no plano de R$89 (~USD 17)
- Usuário tem "custo zero de API" — percepção de valor muito maior

### Estratégia de lançamento do Indie

**Pré-lançamento (2 semanas antes):**
- Anunciar para Founders Circle primeiro
- Oferta de Early Adopter: primeiros 50 assinantes pagam R$19/mês pelo primeiro ano (lock-in)
- Gerar lista de espera com simples formulário

**Lançamento (Dia 1):**
- Post em todos os canais simultaneamente
- Product Hunt launch (coordenado com comunidade)
- Email para toda lista de espera (via Mailchimp free tier)
- Discord announcement + Twitter thread

**Pós-lançamento (primeira semana):**
- Responder cada assinante pessoalmente (se volume permitir)
- Pedir feedback sobre onboarding
- Documentar primeiras objeções de quem não converteu

### Infraestrutura de pagamento

**Opção A — Stripe (recomendada)**
- Aceita cartão e PIX (via integração)
- Subscription automática com dunning
- Dashboard de MRR nativo
- Custo: 3.4% + R$0.40 por transação no Brasil
- Integração técnica: algumas horas de trabalho

**Opção B — Hotmart/Kirvano (alternativa BR)**
- Mais conhecida no mercado BR para infoprodutos
- PIX nativo, boleto, parcelamento
- Menos amigável para subscription técnica

**Recomendação:** Stripe para subscription mensal/anual. Hotmart como canal adicional se necessário.

### Projeção Fase 2

| Mês | Usuários grátis | Pagantes | MRR |
|-----|----------------|---------|-----|
| 3 | 200 | 10 | R$390 |
| 4 | 350 | 25 | R$975 |
| 5 | 500 | 50 | R$1.950 |
| 6 | 700 | 80 | R$3.120 |

---

## FASE 3 — TESSY PRO + LLM GATEWAY (Mês 6+)

### Objetivo
Introduzir o produto de maior margem: créditos LLM gerenciados.

### Modelo econômico do LLM Gateway

```
Tessy compra:
  OpenRouter créditos: USD 0.002/1k tokens (custo médio ponderado)

Tessy vende (embutido no Pro):
  R$89/mês = ~USD 17
  Inclui: USD 10 em créditos = ~5M tokens/mês para o usuário médio

Margem bruta no plano Pro:
  USD 17 (receita) - USD 10 (créditos) - ~USD 2 (infra/stripe) = ~USD 5/usuário/mês
  ~30% de margem bruta
```

**Por que o usuário paga mais por isso:**
- Zero configuração de API keys
- Sem risco de surprise billing
- Custo mensal previsível
- Tessy gerencia o routing (modelo certo para cada task)

### Revenue Streams nesta fase

| Stream | Modelo | Margem estimada |
|--------|--------|----------------|
| Tessy Indie (subscription) | R$39/mês | ~85% (SaaS puro) |
| Tessy Pro (subscription + créditos) | R$89/mês | ~30% |
| Affiliate (LLM providers) | % da receita do usuário | 100% (custo zero) |
| Founders Circle Apoiadores | Doação voluntária | 97% (apenas Stripe fee) |

---

## FASE 4 — TESSY TEAMS / ENTERPRISE (Mês 12+)

### Objetivo
Capturar o Segmento C (devs sêniors e tech leads) com produto colaborativo.

### O que seria o Teams

- Workspace compartilhado com múltiplos usuários
- Políticas de LLM por equipe (modelo padrão, budget por membro)
- Histórico compartilhado e auditável
- Vault centralizado de API keys da empresa
- Dashboard de cost tracking por membro/projeto
- SSO (SAML/OAuth)

### Modelo de preços Teams

R$199/mês para até 5 membros + R$29/membro adicional

**Por que vale mais para empresas:**
- Auditabilidade (LGPD, compliance)
- Vault centralizado reduz risco de segurança
- Cost tracking por projeto = ROI mensurável
- Local-first = dados sensíveis não saem da empresa

### Projeção Fase 4

- 10 equipes pagantes = R$2.000/mês base
- 20 equipes = R$4.000/mês base
- Upsell para Pro dentro das equipes = multiplicador

---

## FASE 5 — TESSY GATEWAY COMO PLATAFORMA (Ano 2+)

### Objetivo
Transformar Tessy de produto em infraestrutura. Receita recorrente de terceiros usando a plataforma.

### Modelos

**5.1 API Gateway Pública**
- Outros devs/startups usam o LLM router do Tessy como backend
- Preço: por token roteado + markup de 20-30%
- Não é competição com OpenRouter — é a camada de inteligência sobre o OpenRouter

**5.2 Tessy MCP Server Hosted**
- Expõe filesystem + terminal + git como MCP tools
- Claude Code, Cursor, e outros podem usar Tessy como backend
- Preço: por sessão de MCP ou subscription mensal

**5.3 Protocol Marketplace**
- Venda de missões TMP prontas (ver análise holística original)
- Modelo: R$9-99 por protocolo, ou acesso total por subscription
- Sem esforço técnico adicional — os protocolos já existem no projeto

**5.4 White-label para empresas**
- Empresa quer um "Tessy privado" com seus modelos e repos
- Licensing do produto + customização
- Modelo: R$2.000-10.000/mês por empresa

---

## MÉTRICAS DE SAÚDE DO NEGÓCIO

### KPIs por fase

| Fase | MRR | Churn | CAC | LTV | Runway |
|------|-----|-------|-----|-----|--------|
| Fase 0 (affiliate) | R$0-500 | — | R$0 | — | — |
| Fase 1 (Founders) | R$200-500 | <5%/mês | R$0 | >R$1k | 6+ meses |
| Fase 2 (Indie) | R$1k-5k | <3%/mês | <R$50 | >R$1.5k | 12+ meses |
| Fase 3 (Pro) | R$5k-20k | <2%/mês | <R$100 | >R$3k | — |
| Fase 4 (Teams) | R$20k+ | <1.5%/mês | <R$500 | >R$10k | — |

### A métrica mais importante em cada fase

- **Fase 0:** Primeira conversão de afiliado (prova de conceito)
- **Fase 1:** NPS dos founders (>50 = produto tem tração real)
- **Fase 2:** Churn do primeiro mês (>10% = problema de onboarding ou produto)
- **Fase 3:** LTV:CAC ratio (>3:1 = negócio sustentável)
- **Fase 4:** Net Revenue Retention (>100% = expansion revenue)

---

## ANTI-PADRÕES A EVITAR

| Anti-padrão | Por que é armadilha | O que fazer em vez |
|------------|---------------------|-------------------|
| Lançar subscription antes de ter 50 usuários ativos | Churn alto vai desanimar. Sem dados para otimizar. | Esperar ter pelo menos 50 usuários semanais |
| Preço muito baixo (R$9/mês) | Atrai usuários low-value, cria volume sem lucro | R$39 mínimo para produto técnico |
| Preço muito alto sem produto completo | Expectativa vs. realidade quebra confiança | Subir preço conforme adiciona features |
| Freemium sem limitações claras | Ninguém converte porque o free já basta | Limitações do free devem doer (de forma justa) |
| Vender enterprise antes de ter produto | Enterprise requer suporte, SLA, customização que você não tem | Chegar no enterprise com produto maduro |
| Depender só de um revenue stream | Risco de concentração | Diversificar em affiliate + subscription + marketplace |

---

## CHECKLIST DE LANÇAMENTO (Fase 2)

Antes de lançar o Tessy Indie:

**Produto:**
- [ ] Multi-provider LLM funcionando (pelo menos OpenRouter + Gemini)
- [ ] Terminal scrollback/clipboard resolvidos
- [ ] GitHub caching implementado (sem rate limit)
- [ ] Onboarding em menos de 5 minutos verificado com 3+ usuários reais
- [ ] Mobile: pelo menos funcional em tablet

**Legal/Financeiro:**
- [ ] Stripe configurado e testado (teste de pagamento real)
- [ ] Termos de uso e política de privacidade publicados
- [ ] Política de reembolso definida (recomendado: 7 dias sem perguntas)
- [ ] Nota fiscal / MEI para receber pagamentos legalmente

**Marketing:**
- [ ] Founders Circle com pelo menos 20 membros ativos
- [ ] 10+ posts de conteúdo publicados e com engajamento
- [ ] Product Hunt submitted (agendado para o dia do launch)
- [ ] Email list com pelo menos 50 pessoas interessadas

**Operações:**
- [ ] Canal de suporte definido (Discord + email)
- [ ] FAQ básico publicado
- [ ] Sistema de rastreamento de bugs para pagantes

---

*Documento 07/07 — Série Estratégia de Negócio Tessy*
*Data: 2026-03-09 | Tessy — Rabelus Lab — Argenta Fenix Initiative*
