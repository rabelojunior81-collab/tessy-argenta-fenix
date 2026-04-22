# Guia Completo do Inception Framework

## De Zero à Missão Concluída — Guia Oficial pt-BR

> **Versão do guia:** 1.0.0 — 2026-03-23
> **Versão do framework:** 2.0.0
> **Idioma:** Português do Brasil (pt-BR) — idioma padrão do projeto

---

## Índice

- [Parte I — Fundamentos](#parte-i--fundamentos)
  - [1. O que é o Inception Framework?](#1-o-que-é-o-inception-framework)
  - [2. Conceitos Fundamentais](#2-conceitos-fundamentais)
  - [3. Arquitetura em Camadas](#3-arquitetura-em-camadas)
- [Parte II — Instalação e Configuração](#parte-ii--instalação-e-configuração)
  - [4. Pré-requisitos do Sistema](#4-pré-requisitos-do-sistema)
  - [5. Instalação Passo a Passo](#5-instalação-passo-a-passo)
  - [6. Primeira Configuração — inception init](#6-primeira-configuração--inception-init)
  - [7. Anatomia do .inception.json](#7-anatomia-do-inceptionjson)
  - [8. Providers — Configuração Detalhada](#8-providers--configuração-detalhada)
- [Parte III — Usando o Agente](#parte-iii--usando-o-agente)
  - [9. Iniciando o Agente — inception start](#9-iniciando-o-agente--inception-start)
  - [10. Interface do Terminal (TUI)](#10-interface-do-terminal-tui)
  - [11. Como Conversar com o Agente](#11-como-conversar-com-o-agente)
  - [12. Slash Commands — Referência Completa](#12-slash-commands--referência-completa)
- [Parte IV — Sistema de Missões](#parte-iv--sistema-de-missões)
  - [13. O que é uma Missão?](#13-o-que-é-uma-missão)
  - [14. Criando uma Missão via CLI](#14-criando-uma-missão-via-cli)
  - [15. Criando uma Missão dentro do Agente](#15-criando-uma-missão-dentro-do-agente)
  - [16. Iniciando o Agente com uma Missão](#16-iniciando-o-agente-com-uma-missão)
  - [17. Gerenciando Missões](#17-gerenciando-missões)
  - [18. Tasks e Journal](#18-tasks-e-journal)
- [Parte V — Avançado](#parte-v--avançado)
  - [19. Segurança e Autonomia](#19-segurança-e-autonomia)
  - [20. Memória e Contexto](#20-memória-e-contexto)
  - [21. Metodologia Inception (IMP/IEP/ISP)](#21-metodologia-inception-impiepísp)
  - [22. Auto-Update de Modelos](#22-auto-update-de-modelos)
- [Parte VI — Referência](#parte-vi--referência)
  - [23. Referência de Comandos CLI](#23-referência-de-comandos-cli)
  - [24. Referência de Slash Commands](#24-referência-de-slash-commands)
  - [25. Referência do .inception.json](#25-referência-do-inceptionjson)
  - [26. FAQ e Troubleshooting](#26-faq-e-troubleshooting)
  - [27. Glossário](#27-glossário)

---

# Parte I — Fundamentos

## 1. O que é o Inception Framework?

O **Inception Framework** é um runtime TypeScript-nativo para agentes de inteligência artificial autônomos. Ele permite que você execute um agente de IA diretamente no seu terminal, conectado ao modelo de linguagem de sua escolha, com capacidade de ler e escrever arquivos, executar comandos, fazer pesquisas na web, e operar com diferentes níveis de autonomia — tudo controlado por você.

### O que diferencia o Inception de um simples chat com IA

A maioria das ferramentas de IA funciona como um chat: você pergunta, a IA responde. O Inception vai além:

| Característica                | Chat comum | Inception Framework                |
| ----------------------------- | ---------- | ---------------------------------- |
| Executa código real           | Não        | Sim (com aprovação)                |
| Lê e escreve arquivos         | Não        | Sim (com controle de segurança)    |
| Tem memória entre sessões     | Não        | Sim (SQLite persistente)           |
| Pode ser orientado por missão | Não        | Sim (wizard + contexto automático) |
| Controla nível de autonomia   | Não        | Sim (Readonly / Supervised / Full) |
| Suporta múltiplos providers   | Limitado   | 14+ providers simultâneos          |
| Interface terminal rica       | Não        | Sim (Ink/React TUI)                |

### Para quem é o Inception?

- **Desenvolvedores** que querem um assistente de IA integrado ao fluxo de trabalho no terminal
- **Pesquisadores** que precisam de um agente autônomo para tarefas longas e estruturadas
- **Profissionais** que trabalham com múltiplos projetos e precisam de contexto por projeto (missões)
- **Entusiastas** que querem explorar agentes de IA com controle real sobre o que acontece

---

## 2. Conceitos Fundamentais

Antes de começar, entenda os conceitos centrais do Inception.

### Agente

O **agente** é o núcleo do sistema. Ele recebe suas mensagens, raciocina usando um modelo de linguagem (LLM), decide quais ações tomar, executa essas ações através de ferramentas (tools), e responde com o resultado. O agente opera em um loop ReAct: **Raciocinar → Agir → Observar → Raciocinar novamente**.

### Provider

O **provider** é o serviço de IA que alimenta o agente. O Inception suporta 13+ providers: Anthropic (Claude), OpenAI (GPT), Google Gemini, Ollama (local), Kimi, Z.AI, Bailian, OpenRouter, Kilo, e outros. O provider é configurável por projeto e até por missão.

### Canal (Channel)

O **canal** é a interface de comunicação entre você e o agente. Atualmente, o canal principal é o **CLI** (terminal interativo com interface visual Ink/React). No futuro próximo: Telegram, HTTP/REST.

### Missão

A **missão** é o conceito mais importante do Inception. Uma missão é um **contexto completo de trabalho** que configura o agente automaticamente para um objetivo específico. Ao criar uma missão, você define o objetivo, a stack tecnológica, a metodologia, as skills necessárias, o nível de autonomia, e as regras. O agente então opera dentro desse contexto.

```
Missão = Objetivo + Tech Stack + Metodologia + Skills + Autonomia + Regras + Tarefas
```

### Ferramenta (Tool)

As **ferramentas** são as ações que o agente pode executar no mundo real: ler arquivos, escrever arquivos, executar comandos no shell, fazer requisições HTTP, buscar na memória. Cada ferramenta tem sua própria allowlist de segurança.

### Memória

O agente tem **memória persistente** entre sessões, armazenada em SQLite com busca por texto completo (FTS5). Ele lembra de conversas anteriores e pode recuperar contexto relevante automaticamente.

### Autonomia

O **nível de autonomia** define o quanto o agente pode agir sem pedir sua aprovação:

- **Readonly** — apenas lê e sugere. Nunca escreve, nunca executa nada
- **Supervised** _(padrão)_ — age, mas pede aprovação antes de ações potencialmente destrutivas (escrever arquivos, executar comandos)
- **Full** — age completamente de forma autônoma, sem pedir aprovação

### Gates (Portões de Qualidade)

Os **gates** são verificações formais de qualidade na metodologia Inception:

| Gate            | Código | Significado                      |
| --------------- | ------ | -------------------------------- |
| TypeScript Gate | G-TS   | Tipos corretos, sem any          |
| Design Gate     | G-DI   | Decisões de design validadas     |
| Security Gate   | G-SEC  | Segurança verificada             |
| UX Gate         | G-UX   | Experiência do usuário aprovada  |
| Release Gate    | G-REL  | Pronto para release              |
| AI Gate         | G-AI   | Comportamento do agente validado |

---

## 3. Arquitetura em Camadas

```
┌──────────────────────────────────────────────────────────────────┐
│                         VOCÊ (Operador)                          │
│               terminal / Telegram / HTTP                         │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      CHANNEL LAYER                               │
│   CLI (Ink/React TUI) ─ Telegram ─ HTTP/REST                     │
│   Responsável por: input, output, slash commands, aprovações     │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                   INCEPTION RUNTIME CORE                         │
│   EventBus, ChannelManager, Container (DI)                       │
│   Responsável por: roteamento, orquestração, eventos             │
└────┬───────────────┬────────────────┬──────────────┬─────────────┘
     │               │                │              │
┌────▼───┐    ┌──────▼──────┐  ┌──────▼──────┐  ┌───▼──────────┐
│Provider│    │    Tools    │  │   Memory    │  │   Protocol   │
│ (LLM)  │    │ (filesystem │  │  (SQLite +  │  │ (Missions,   │
│        │    │  shell,http)│  │   FTS5)     │  │  Tasks,      │
└────┬───┘    └──────┬──────┘  └─────────────┘  │  Journal)    │
     │               │                           └──────────────┘
     └───────────────┘
              │
    ┌─────────▼──────────────────────────────────┐
    │              AGENT LOOP (ReAct)             │
    │  1. Recebe mensagem do canal                │
    │  2. Busca memória relevante                 │
    │  3. Constrói system prompt (+ missão ativa) │
    │  4. Chama o provider (LLM)                  │
    │  5. Processa tool calls (com aprovação)     │
    │  6. Armazena na memória                     │
    │  7. Retorna resposta ao canal               │
    └────────────────────────────────────────────┘
```

---

# Parte II — Instalação e Configuração

## 4. Pré-requisitos do Sistema

### Node.js 22+ (OBRIGATÓRIO)

O Inception usa `node:sqlite`, um módulo nativo disponível apenas a partir do **Node.js 22**. Versões anteriores (20, 21) não funcionarão.

**Como verificar:**

```bash
node --version
# Deve mostrar: v22.x.x ou v23.x.x ou v25.x.x
# Se mostrar v20 ou v21: ATUALIZE antes de continuar
```

**Como instalar/atualizar Node.js 22:**

```bash
# Windows — use o instalador oficial:
# https://nodejs.org/en/download/ → Selecione a versão 22 LTS

# Mac — usando Homebrew:
brew install node@22
brew link node@22 --force

# Linux (Ubuntu/Debian) — usando NodeSource:
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Usando NVM (qualquer sistema) — recomendado para desenvolvedores:
nvm install 22
nvm use 22
nvm alias default 22
```

### pnpm 8+ (OBRIGATÓRIO)

O Inception usa pnpm como gerenciador de pacotes. O npm padrão não funcionará para o monorepo.

```bash
# Instalar pnpm globalmente:
npm install -g pnpm

# Verificar:
pnpm --version
# Deve mostrar: 8.x.x ou superior
```

### Git

```bash
# Verificar:
git --version

# Instalar no Ubuntu/Debian:
sudo apt install git

# Instalar no Mac:
xcode-select --install

# Instalar no Windows:
# https://git-scm.com/download/win
```

### Chave de API de um Provider

Você precisará de pelo menos uma chave de API para um dos providers suportados. As opções mais comuns:

| Provider        | Onde obter a chave                    | Tem plano gratuito?         |
| --------------- | ------------------------------------- | --------------------------- |
| Ollama (local)  | Não precisa de chave                  | Sim, totalmente gratuito    |
| Kimi / Moonshot | platform.moonshot.ai/console/api-keys | Créditos iniciais gratuitos |
| Z.AI / Zhipu    | z.ai                                  | Tier gratuito disponível    |
| Anthropic       | console.anthropic.com                 | Não (requer cartão)         |
| OpenAI          | platform.openai.com/api-keys          | Não (requer cartão)         |
| Google Gemini   | aistudio.google.com/apikey            | Sim (Gemini Flash gratuito) |
| OpenRouter      | openrouter.ai/keys                    | Créditos gratuitos iniciais |

> **Recomendação para iniciantes:** Use **Ollama** (totalmente local e gratuito) para aprender o sistema, depois migre para um provider cloud conforme sua necessidade.

---

## 5. Instalação Passo a Passo

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/rabelojunior81-collab/inception-v2-rabelus.git
cd inception-v2-rabelus
```

> **Nota:** Após a publicação no npm, a instalação será simplificada. Por enquanto, o método é clonar o repositório.

### Passo 2: Instalar dependências

```bash
pnpm install
```

Este comando instala todas as dependências de todos os pacotes do monorepo. Pode demorar 1-3 minutos na primeira execução.

**Se der erro:**

- Verifique se está na pasta correta: `ls` deve mostrar `package.json`, `apps/`, `packages/`
- Verifique a versão do pnpm: `pnpm --version` (deve ser 8+)
- Verifique a versão do Node: `node --version` (deve ser 22+)

### Passo 3: Build de todos os pacotes

```bash
pnpm build
```

Compila todos os 20+ pacotes do monorepo usando tsup/esbuild. A saída vai para `dist/` em cada pacote.

**Saída esperada:**

```
Tasks:    30 successful, 30 total
Time:     ~15s
```

Se aparecer erros de build, não prossiga — verifique a seção de Troubleshooting.

### Passo 4: Verificar a instalação

```bash
# Na pasta raiz do repositório:
node apps/cli/dist/index.js --version
# Deve mostrar: 0.0.0

node apps/cli/dist/index.js --help
# Deve listar todos os comandos disponíveis
```

### Passo 5: Criar um diretório de projeto

O Inception opera **dentro de um diretório de projeto**. O arquivo `.inception.json` fica nesse diretório, e o agente trabalha com os arquivos dentro dele.

```bash
# Exemplo: criar um projeto de teste
mkdir ~/meu-projeto-ia
cd ~/meu-projeto-ia

# Ou usar um projeto existente:
cd ~/meu-projeto-existente
```

---

## 6. Primeira Configuração — inception init

O comando `inception init` é um wizard interativo que cria o arquivo `.inception.json` no diretório atual. **Execute dentro do seu diretório de projeto.**

```bash
# Estando dentro do diretório do seu projeto:
node /caminho/para/inception-v2-rabelus/apps/cli/dist/index.js init
```

> **Dica de produtividade:** Crie um alias no seu shell para não precisar digitar o caminho completo toda vez:
>
> ```bash
> # Adicione ao ~/.bashrc ou ~/.zshrc:
> alias inception="node /caminho/para/inception-v2-rabelus/apps/cli/dist/index.js"
> ```

### O que o wizard de init pergunta

O wizard passa por várias etapas. Aqui está o que cada pergunta significa e o que responder:

**① Nome do agente**
Como o agente se chamará. Aparece na barra de status do terminal.

- Exemplo: `Leilai`, `Tessy`, `MeuAgente`

**② Provider**
Qual serviço de IA usar. Você verá uma lista numerada com todos os providers disponíveis. Digite o número correspondente.

- Para começar sem custo: escolha `ollama`
- Para a melhor qualidade: escolha `anthropic` ou `kimi`

**③ Chave de API**
A chave de API do provider escolhido. Para Ollama, deixe em branco (não precisa).

- A chave é armazenada no `.inception.json` local — nunca sai da sua máquina
- Nunca versione o `.inception.json` com a chave em repositórios públicos

**④ Modelo**
O modelo específico do provider. O wizard mostra uma lista atualizada automaticamente dos modelos disponíveis.

- Para Kimi: `kimi-k2.5` (padrão, mais capaz)
- Para Anthropic: `claude-sonnet-4-6`
- Para OpenAI: `gpt-5.4`
- Para Ollama local: `qwen2.5`, `llama3`, `mistral`

**⑤ Nome do operador**
Seu nome ou o papel que você exerce. O agente usa isso para se referir a você.

- Exemplo: `Rabelus`, `Operador`, `Dev`

**⑥ Idioma**
O idioma padrão de resposta do agente.

- `pt-BR` para português do Brasil
- `en` para inglês

**⑦ Propósito do agente**
Uma frase descrevendo a finalidade principal do agente neste projeto.

- Exemplo: `Assistente de desenvolvimento de software para o projeto X`

**⑧ Tom**
O estilo de comunicação do agente:

- `direct` — respostas diretas e objetivas
- `formal` — linguagem formal
- `friendly` — tom amigável e conversacional

### Resultado

Ao terminar, o wizard cria `.inception.json` no diretório atual. Exemplo:

```json
{
  "agent": {
    "name": "Leilai",
    "purpose": "Assistente de IA para gestão de leilões de joias",
    "language": "pt-BR",
    "tone": "direct"
  },
  "operator": {
    "name": "Rabelus"
  },
  "defaultProvider": "kimi",
  "providers": {
    "kimi": {
      "apiKey": "sk-sua-chave-aqui",
      "baseUrl": "https://api.moonshot.ai/v1"
    }
  }
}
```

> **IMPORTANTE:** Adicione `.inception.json` ao `.gitignore` se seu projeto for open source, pois ele contém sua chave de API:
>
> ```bash
> echo ".inception.json" >> .gitignore
> ```

---

## 7. Anatomia do .inception.json

O `.inception.json` é o arquivo de configuração central do Inception para um projeto. Aqui está a referência completa de todos os campos possíveis:

```json
{
  "agent": {
    "name": "string — nome do agente (aparece na TUI)",
    "purpose": "string — propósito/missão geral do agente",
    "language": "string — 'pt-BR', 'en', 'es', 'zh'",
    "tone": "string — 'direct', 'formal', 'friendly'",
    "nature": "string — 'AI', 'Human', 'Hybrid'",
    "values": [],
    "limits": []
  },
  "operator": {
    "name": "string — seu nome ou papel",
    "autonomyLevel": "string — 'Readonly', 'Supervised', 'Full'",
    "reportFrequency": "string — 'PerTurn', 'PerMission', 'Manual'",
    "reportFormat": "string — 'Markdown', 'JSON'"
  },
  "defaultProvider": "string — slug do provider padrão",
  "providers": {
    "kimi": {
      "apiKey": "string — sua chave de API",
      "baseUrl": "string — URL base da API (opcional, usa o padrão)"
    },
    "anthropic": {
      "apiKey": "string — sua chave Anthropic"
    },
    "ollama": {
      "baseUrl": "string — padrão: http://localhost:11434"
    }
  },
  "security": {
    "execution": {
      "allowedCommands": ["git", "node", "python", "docker"],
      "blockedCommands": ["rm", "del", "format"]
    },
    "filesystem": {
      "allowedPaths": ["./src", "./tests", "./docs"],
      "blockedPaths": ["/etc", "/sys"]
    }
  },
  "logging": {
    "level": "string — 'debug', 'info', 'warn', 'error'"
  }
}
```

### Configuração de múltiplos providers

Você pode configurar vários providers e alternar entre eles:

```json
{
  "defaultProvider": "kimi",
  "providers": {
    "kimi": {
      "apiKey": "sk-moonshot-..."
    },
    "anthropic": {
      "apiKey": "sk-ant-..."
    },
    "ollama": {
      "baseUrl": "http://localhost:11434"
    }
  }
}
```

Para usar um provider específico ao iniciar:

```bash
node apps/cli/dist/index.js start --provider anthropic
node apps/cli/dist/index.js start --provider ollama --model qwen2.5
```

---

## 8. Providers — Configuração Detalhada

O Inception suporta 13 providers. Aqui estão os detalhes de configuração de cada um:

### Kimi / Moonshot AI (`kimi`)

O provider mais recomendado para uso geral. Excelente relação custo/benefício, 256K tokens de contexto, suporte a visão.

```json
{
  "providers": {
    "kimi": {
      "apiKey": "sk-...",
      "baseUrl": "https://api.moonshot.ai/v1"
    }
  }
}
```

**Modelos disponíveis:**

- `kimi-k2.5` — flagship, 256K contexto, multimodal, agentic _(padrão)_
- `kimi-k2-thinking` — modo de raciocínio estendido
- `kimi-k2-thinking-turbo` — raciocínio mais rápido
- `kimi-k2-turbo-preview` — menor custo
- `moonshot-v1-128k` — legado, 128K contexto

**Onde obter a chave:** https://platform.moonshot.ai/console/api-keys

### Kimi Coding Plan (`kimi-coding`)

Plano de assinatura especial otimizado para código. Endpoint diferente.

```json
{
  "providers": {
    "kimi-coding": {
      "apiKey": "sk-...",
      "baseUrl": "https://api.kimi.com/coding/v1"
    }
  }
}
```

**Modelos:** `kimi-for-coding`, `kimi-k2-thinking-turbo`

### Z.AI / Zhipu (`zai`)

Provider chinês de alta qualidade. GLM-5 é excelente para tarefas de engenharia.

```json
{
  "providers": {
    "zai": {
      "apiKey": "sua-chave-zai",
      "baseUrl": "https://api.z.ai/api/paas/v4"
    }
  }
}
```

**Modelos principais:**

- `GLM-5` — próxima geração, agentic engineering
- `GLM-5-Turbo` — mais rápido para workloads longos
- `GLM-4.7` — flagship atual _(padrão)_
- `GLM-4.5-air` — gratuito (tier free)

### Bailian / DashScope (`bailian`)

Gateway da Alibaba Cloud com acesso a Qwen, GLM, Kimi e outros.

```json
{
  "providers": {
    "bailian": {
      "apiKey": "sk-sp-...",
      "baseUrl": "https://coding-intl.dashscope.aliyuncs.com/v1"
    }
  }
}
```

> **Atenção:** Bailian tem dois endpoints distintos:
>
> - **Coding Plan** (`sk-sp-...`): `https://coding-intl.dashscope.aliyuncs.com/v1`
> - **PAYG** (`sk-...`): `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

### Anthropic Claude (`anthropic`)

Melhor qualidade para raciocínio complexo e tarefas técnicas.

```json
{
  "providers": {
    "anthropic": {
      "apiKey": "sk-ant-..."
    }
  }
}
```

**Modelos:**

- `claude-sonnet-4-6` — equilíbrio velocidade/qualidade _(padrão)_
- `claude-opus-4-6` — máxima qualidade
- `claude-haiku-4-5-20251001` — mais rápido e barato

**Onde obter:** https://console.anthropic.com

### OpenAI (`openai`)

```json
{
  "providers": {
    "openai": {
      "apiKey": "sk-..."
    }
  }
}
```

**Modelos:** `gpt-5.4`, `gpt-4o`, `o3`, `o4-mini`

### Google Gemini (`gemini`)

```json
{
  "providers": {
    "gemini": {
      "apiKey": "sua-chave-gemini"
    }
  }
}
```

**Modelos:** `gemini-2.5-flash` _(padrão)_, `gemini-2.5-pro`

**Onde obter:** https://aistudio.google.com/apikey

### Ollama (local) (`ollama`)

Totalmente gratuito, roda na sua máquina. Requer instalação separada do Ollama.

```bash
# Instalar Ollama: https://ollama.ai
# Baixar um modelo:
ollama pull qwen2.5
ollama pull llama3
ollama pull mistral
```

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434"
    }
  }
}
```

> **Não precisa de chave de API.** O servidor Ollama precisa estar rodando antes de usar.

### OpenRouter (`openrouter`)

Gateway com acesso a 300+ modelos de vários providers.

```json
{
  "providers": {
    "openrouter": {
      "apiKey": "sk-or-..."
    }
  }
}
```

**Onde obter:** https://openrouter.ai/keys

---

# Parte III — Usando o Agente

## 9. Iniciando o Agente — inception start

Com o `.inception.json` configurado no seu diretório de projeto, inicie o agente:

```bash
# Estando dentro do diretório do projeto:
node /caminho/para/inception-v2-rabelus/apps/cli/dist/index.js start
```

### Opções disponíveis

```bash
# Forçar um provider específico (ignora o defaultProvider do .inception.json):
node apps/cli/dist/index.js start --provider kimi
node apps/cli/dist/index.js start --provider anthropic
node apps/cli/dist/index.js start --provider ollama

# Forçar um modelo específico:
node apps/cli/dist/index.js start --model kimi-k2-thinking
node apps/cli/dist/index.js start --provider anthropic --model claude-opus-4-6

# Especificar banco de memória alternativo:
node apps/cli/dist/index.js start --memory /caminho/para/memory.db

# Modo debug (informações extras no boot):
node apps/cli/dist/index.js start --debug

# Iniciar já com uma missão ativa:
node apps/cli/dist/index.js mission start <id-da-missao>
```

### O que acontece no boot

Quando o agente inicia:

1. Lê o `.inception.json` do diretório atual
2. Inicializa o provider escolhido (conecta e valida a chave)
3. Abre o banco de memória SQLite (`~/.inception/memory.db`)
4. Inicializa as ferramentas (filesystem, shell, http)
5. Inicializa o gerenciador de segurança
6. Atualiza o cache de modelos em background (sem bloquear)
7. Renderiza a interface TUI (Ink/React)

---

## 10. Interface do Terminal (TUI)

Quando o agente está rodando, você vê:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Leilai  ● Pronto                            [Missão Ativa]  Ctrl+C to exit  │
└─────────────────────────────────────────────────────────────────────────────┘

 ◆ Agente 10:23
   Olá! Estou pronto para trabalhar. Como posso ajudar?

 ▶ Você  10:24
   Analise os arquivos neste diretório e me diga o que há aqui.

 ◆ Agente 10:24
   Encontrei os seguintes arquivos...

[Digite sua mensagem aqui... (/help para ver comandos)]
```

### Elementos da interface

**Barra de status (topo):**

- Nome do agente
- Estado atual: `Pronto` / `Pensando...` / `Executando tool` / `Aguardando aprovação`
- Missão ativa (se houver)
- Atalho para sair

**Área de mensagens (centro):**

- `◆ Agente` — mensagens do agente
- `▶ Você` — suas mensagens
- `• Sistema` — mensagens de sistema (slash commands, notificações)

**Input (baixo):**

- Campo de texto para digitar mensagens e slash commands
- Mostra `Processando...` durante execução
- Durante o wizard de missão: mostra as perguntas do wizard

### Estados do agente

| Estado                 | Significado                                   |
| ---------------------- | --------------------------------------------- |
| `Pronto`               | Aguardando sua entrada                        |
| `Pensando...`          | Consultando o modelo de linguagem             |
| `Executando tool`      | Executando uma ferramenta (ler arquivo, etc.) |
| `Aguardando aprovação` | Esperando você aprovar uma ação               |
| `Erro`                 | Ocorreu um erro (verifique o log)             |

### Aprovações

Quando o agente precisa executar algo potencialmente perigoso (escrever arquivo, executar comando), no modo **Supervised**, ele mostra um prompt de aprovação:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ APROVAÇÃO NECESSÁRIA                                                         │
│                                                                             │
│ O agente quer executar:  shell.exec                                         │
│ Ferramenta: RunCommand                                                      │
│ Argumento: git commit -m "feat: implementar módulo de autenticação"         │
│                                                                             │
│ [A]provar  [R]ejeitar  [E]xpira em: 120s                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

Pressione `A` para aprovar ou `R` para rejeitar.

---

## 11. Como Conversar com o Agente

### Linguagem natural

O agente entende português do Brasil (ou o idioma configurado). Você pode falar naturalmente:

```
Você: Cria um arquivo README.md para este projeto com uma descrição básica
Você: Quais arquivos .ts existem nesta pasta e nas subpastas?
Você: Faz um commit com as mudanças que fizemos hoje
Você: Analisa este código e me aponta possíveis bugs
```

### Referenciando arquivos

O agente pode ler qualquer arquivo dentro do diretório de trabalho (e subdiretórios, conforme as `allowedPaths`):

```
Você: Lê o arquivo src/auth/index.ts e explica o que ele faz
Você: Compara os arquivos package.json e package-lock.json
Você: Encontra todos os TODOs nos arquivos TypeScript
```

### Executando comandos

Com autonomia Supervised, o agente pede aprovação antes de executar comandos listados em `allowedCommands`:

```
Você: Roda os testes do projeto
Você: Faz um git status e me diz o que está pendente
Você: Instala a dependência zod no projeto
```

### Contexto de missão

Quando há uma missão ativa, o agente conhece o objetivo, as regras e as tarefas. Use isso:

```
Você: Qual é nossa missão atual?
Você: Quais tasks ainda estão pendentes?
Você: Registra que implementei a autenticação JWT hoje
```

---

## 12. Slash Commands — Referência Completa

Os slash commands são comandos especiais digitados no chat do agente. Eles NÃO são enviados ao modelo de linguagem — são processados diretamente pelo sistema.

**Regra:** Todo slash command começa com `/`

### Comandos de missão

#### `/mission`

Exibe o resumo completo da missão ativa.

```
 • Sistema
   Missão: Gestão de Leilões Elo Dourado
   Status: running  |  Modo: Executor  |  Autonomia: supervised
   Tasks: 2/8 concluídas

   Tasks pendentes:
     ▶ [task_abc] Implementar módulo de autenticação
     ○ [task_def] Criar API de criação de lotes
     ○ [task_ghi] Integrar pagamento
```

#### `/mission create`

Inicia o wizard de criação de missão **diretamente no chat**, sem sair do agente. Veja a [Parte IV](#parte-iv--sistema-de-missões) para detalhes completos.

### Comandos de tarefas

#### `/task list`

Lista todas as tasks pendentes da missão ativa.

```
Você: /task list

 • Sistema
   Tasks pendentes:
     ○ [task_abc123] (B) Implementar módulo de autenticação
     ▶ [task_def456] (B) Criar API de criação de lotes — em andamento
```

#### `/task done <descrição>`

Registra uma task como concluída. Útil para marcar progresso durante a conversa.

> **⚠️ Status (Gap G1):** Confirmação visual apenas — a task **não é persistida** no banco de dados SQLite. `/task list` não refletirá a mudança após reiniciar o agente. Resolução prevista: Sprint 2, ss-2.2.

```
Você: /task done Implementei o módulo de autenticação JWT com refresh tokens

 • Sistema
   [Task concluída] Implementei o módulo de autenticação JWT com refresh tokens
```

#### `/task add <descrição>`

Adiciona uma nova task à missão ativa.

> **⚠️ Status (Gap G1):** Confirmação visual apenas — a task **não é persistida** no SQLite. Resolução prevista: Sprint 2, ss-2.2.

```
Você: /task add Implementar rate limiting na API

 • Sistema
   [Task adicionada] Implementar rate limiting na API
```

### Comandos informativos

#### `/status`

Exibe o estado completo do agente: provider, modelo, tokens usados, missão ativa.

```
 • Sistema
   Provider: kimi
   Modelo:   kimi-k2.5
   Agente:   Leilai
   Tokens:   12.847
   Missão:   Gestão de Leilões Elo Dourado [running] — 5 task(s) pendente(s)
```

#### `/rules`

Exibe as regras e metadados da missão ativa.

```
 • Sistema
   Regras da missão: Gestão de Leilões Elo Dourado
     Modo: Executor
     Autonomia: supervised
     Prioridade: 1
     Tags: type:development, methodology:tdd, stack:node
```

#### `/help`

Lista todos os slash commands disponíveis.

### Comandos de controle

#### `/note <texto>`

Registra uma nota no journal da missão.

> **⚠️ Status (Gap G1):** Confirmação visual apenas — a nota **não é persistida** no SQLite. Resolução prevista: Sprint 2, ss-2.2.

```
Você: /note Decidimos usar JWT com refresh tokens de 7 dias por questão de segurança

 • Sistema
   [Nota registrada] Decidimos usar JWT com refresh tokens de 7 dias...
```

#### `/pause`

Encerra o agente de forma graciosa.

#### `/stop` / `/exit`

Encerra o agente imediatamente.

> **Dica:** Para sair de qualquer jeito, pressione `Ctrl+C`.

---

# Parte IV — Sistema de Missões

## 13. O que é uma Missão?

Uma **missão** é um contexto completo de trabalho que o agente carrega para operar de forma focada e estruturada. Diferente de apenas conversar com o agente, uma missão define:

- **O objetivo** — o que deve ser alcançado
- **O tipo** — desenvolvimento, pesquisa, análise, automação, refatoração, investigação
- **A stack** — as tecnologias envolvidas (Node, Python, Docker, etc.)
- **A metodologia** — como o trabalho deve ser conduzido (TDD, Research-First, Sprint, etc.)
- **O nível de autonomia** — quanta liberdade o agente tem para agir
- **As skills** — capacidades específicas necessárias (web scraping, deploy, etc.)
- **As regras** — restrições e normas específicas deste projeto
- **As tarefas** — o breakdown do trabalho a ser feito

### Por que usar missões?

Sem missão, o agente é um assistente genérico. **Com missão**, o agente é um especialista configurado para aquele trabalho:

- Ele sabe exatamente o que precisa ser feito
- Ele opera com o nível de autonomia correto para o projeto
- Ele tem as ferramentas certas habilitadas automaticamente
- O system prompt inclui todas as regras e contexto do projeto
- As tarefas ficam registradas e acompanháveis

### Mapeamento orgânico (Skill → Configuração automática)

Quando você cria uma missão, as suas escolhas no wizard **configuram o agente automaticamente**:

| Você escolhe no wizard       | O sistema configura automaticamente                               |
| ---------------------------- | ----------------------------------------------------------------- |
| Tipo `Development`           | ReadFileTool + WriteFileTool + RunCommandTool, git na allowlist   |
| Tech Stack `Python`          | `python`, `pip`, `venv`, `pytest` em allowedCommands              |
| Tech Stack `Docker`          | `docker`, `docker-compose`, `kubectl` em allowedCommands          |
| Skill `Deploy/DevOps`        | `gh`, `ssh`, `scp`, `rsync` em allowedCommands                    |
| Autonomia `Full`             | AutonomyLevel.Full — zero aprovações necessárias                  |
| Autonomia `Supervised`       | AutonomyLevel.Supervised — aprovação para ações destrutivas       |
| Autonomia `Readonly`         | AutonomyLevel.Readonly — agente só lê e sugere                    |
| Metodologia `TDD`            | Contexto TDD injetado no system prompt                            |
| Metodologia `Research-First` | Agente inicia em modo Auditor (A), depois migra para Executor (B) |

---

## 14. Criando uma Missão via CLI

Fora do agente (no terminal normal), use:

```bash
node apps/cli/dist/index.js mission create
```

O wizard interativo guia você pelos 9 passos:

### Passo 1: Nome da Missão

Dê um nome curto e descritivo.

```
── [1/9] Nome da Missão ──
Qual é o nome desta missão?
Dica: Use um nome curto e descritivo (ex: "Implementar módulo de autenticação")

  > Gestão de Leilões Elo Dourado
```

### Passo 2: Tipo de Missão

Escolha o tipo que melhor descreve o trabalho.

```
── [2/9] Tipo de Missão ──
Qual é o tipo desta missão?

   1. Desenvolvimento  — Construir ou estender uma feature, módulo ou sistema
   2. Pesquisa         — Investigar um tema e produzir descobertas ou relatório
   3. Análise          — Examinar código, dados ou sistemas existentes
   4. Automação        — Criar scripts ou pipelines que automatizam processos
   5. Refatoração      — Melhorar qualidade sem alterar comportamento
   6. Investigação     — Depurar ou diagnosticar um problema
```

### Passo 3: Descrição

Descreva detalhadamente o objetivo. Quanto mais específico, melhor o contexto do agente.

### Passo 4: Stack de Tecnologias

Selecione todas as tecnologias envolvidas (múltipla escolha — números separados por espaço ou vírgula).

```
   1. Node.js / TypeScript
   2. Python
   3. Go
   4. Docker / Kubernetes
   5. Browser / Frontend
   6. REST / GraphQL API
   7. Banco de Dados SQL
   8. Banco de Dados NoSQL
```

Para selecionar Node.js, API e SQL: `1 6 7` ou `1,6,7`

### Passo 5: Metodologia

Como o trabalho deve ser conduzido.

```
   1. Exploratório — descobrir o espaço do problema antes de comprometer-se
   2. TDD          — escrever testes antes da implementação
   3. Pesquisa Primeiro — documento de design antes de escrever código
   4. Sprint       — execução com tempo definido e backlog estabelecido
   5. Autônomo     — agente age de forma independente
```

### Passo 6: Nível de Autonomia

Quanto o agente pode fazer sem pedir sua aprovação.

```
   1. Somente leitura (apenas observar)
   2. Supervisionado (solicita aprovação para ações de risco)
   3. Autonomia total (age de forma independente)
```

### Passo 7: Skills Necessárias

Capacidades específicas que serão necessárias (múltipla escolha).

```
   1. Web Scraping
   2. Geração de Código
   3. Análise de Dados
   4. Integração de API
   5. Deploy / DevOps
   6. Documentação
```

### Passo 8: Regras da Missão (opcional)

Regras e restrições específicas para este projeto. Separe por vírgula.

```
Dica: ex: "Nunca deletar dados de produção", "Sempre escrever testes antes da implementação"

  > Nunca modificar o banco de produção, sempre escrever testes unitários
```

### Passo 9: Tarefas Iniciais (opcional)

O breakdown inicial das tarefas. Separe por vírgula.

```
  > Modelar o banco de dados, criar API de autenticação, implementar módulo de leilões
```

### Resultado

Ao concluir, o sistema mostra o resumo e pergunta se deseja iniciar o agente com esta missão:

```
╔════════════════════════════════════════════════════════════════╗
║ MISSAO CRIADA COM SUCESSO                                      ║
╚════════════════════════════════════════════════════════════════╝

  ID:        miss_abc123_xyz
  Título:    Gestão de Leilões Elo Dourado
  Tipo:      Desenvolvimento
  Tasks:     3
  Status:    pending

  Deseja iniciar o agente com esta missão agora? [S/n]: S
```

O ID da missão (`miss_abc123_xyz`) é importante — anote-o para usar depois.

---

## 15. Criando uma Missão dentro do Agente

Você pode criar uma missão **sem sair do agente** usando o slash command `/mission create`. O wizard roda diretamente no chat.

```
Você: /mission create

 • Sistema
   ── WIZARD DE MISSÃO ──
   Responda as perguntas abaixo no chat.

 • Sistema
   ── [1/9] Nome da Missão ──
   Qual é o nome desta missão?
   Dica: Use um nome curto e descritivo...

Você: Elo Dourado — Joalheria AI-Driven

 • Sistema
   ── [2/9] Tipo de Missão ──
   Qual é o tipo desta missão?

     1. Desenvolvimento  — Construir ou estender uma feature...
     ...

Você: 1

   [continua pelos 9 passos...]

 • Sistema
   ✓ Missão criada: "Elo Dourado — Joalheria AI-Driven"
     ID: miss_def456_uvw
     Tasks: 3
     Autonomia: supervised

   O agente agora opera no contexto desta missão.
```

### Comportamento do wizard inline

- **Inputs vão para o wizard** enquanto ele está ativo — não são enviados ao modelo de linguagem
- **Validação automática**: se houver erros (ex: nome muito curto), o wizard reinicia do passo 1 mostrando os erros
- **Cancelar**: digitar `/stop` durante o wizard cancela a criação e volta ao chat normal
- **Após criar**: a missão fica ativa imediatamente na sessão atual

---

## 16. Iniciando o Agente com uma Missão

Para iniciar o agente já carregado com uma missão existente:

```bash
# Listar missões disponíveis:
node apps/cli/dist/index.js mission list

# Iniciar com uma missão específica:
node apps/cli/dist/index.js mission start miss_abc123_xyz
```

O agente inicia com o contexto da missão já injetado no system prompt, incluindo o título, a descrição, as tarefas pendentes e as regras.

---

## 17. Gerenciando Missões

### Listar todas as missões

```bash
node apps/cli/dist/index.js mission list
```

Saída:

```
╔════════════════════════════════════════════════════════════════╗
║ MISSOES INCEPTION                                              ║
╚════════════════════════════════════════════════════════════════╝

  ID                TÍTULO                     STATUS       TASKS   CRIADA
  ────────────────  ─────────────────────────  ───────────  ──────  ──────────
  miss_abc123_xyz   Gestão Leilões Elo Doura…  running      2/8     2026-03-23
  miss_def456_uvw   Refatoração AuthModule     pending      0/5     2026-03-22

  Total: 2 missão(ões)
```

### Ver status detalhado de uma missão

```bash
# Status de todas as missões ativas:
node apps/cli/dist/index.js mission status

# Status de uma missão específica:
node apps/cli/dist/index.js mission status miss_abc123_xyz
```

Saída com progresso:

```
── STATUS DA MISSAO: Gestão Leilões Elo Dourado ──

  ID:         miss_abc123_xyz
  Status:     running
  Autonomia:  supervised
  Criada em:  2026-03-23T14:30:00.000Z
  Iniciada:   2026-03-23T14:35:00.000Z

  TAREFAS (2/8 concluídas)
  ████████░░░░░░░░░░░░ 25%

  [v] Modelar o banco de dados                               (concluída)
  [v] Criar API de autenticação                              (concluída)
  [>] Implementar módulo de leilões                          (em andamento)
  [ ] Criar sistema de pagamento                             (pendente)
  [ ] Implementar notificações                               (pendente)
  ...
```

### Gerar relatório de uma missão

```bash
# Relatório da missão mais recente:
node apps/cli/dist/index.js mission report

# Relatório de uma missão específica:
node apps/cli/dist/index.js mission report miss_abc123_xyz
```

O relatório é salvo em `~/.inception/reports/mission_<id>_<data>.md` e inclui:

- Objetivo e descrição
- Tarefas concluídas
- Tarefas com falha/bloqueadas
- Tarefas pendentes
- Timeline completa

### Arquivar uma missão

Quando a missão está concluída, arquive-a para o journal imutável:

```bash
node apps/cli/dist/index.js mission archive miss_abc123_xyz
```

O sistema pede confirmação antes de arquivar (ação irreversível). Após arquivar, a missão vai para o journal SQLite e não aparece mais em `mission list` (mas pode ser consultada via `mission status`).

---

## 18. Tasks e Journal

### Tasks (Tarefas)

As tasks de uma missão têm os seguintes estados:

| Estado        | Ícone | Significado                           |
| ------------- | ----- | ------------------------------------- |
| `pending`     | `[ ]` | Aguardando execução                   |
| `in_progress` | `[>]` | Em andamento                          |
| `completed`   | `[v]` | Concluída com sucesso                 |
| `blocked`     | `[!]` | Bloqueada por dependência ou problema |
| `skipped`     | `[-]` | Ignorada (decisão deliberada)         |

### Journal

O journal é um registro **imutável** de tudo que aconteceu durante a missão. Cada entrada no journal inclui o snapshot da missão no momento do arquivamento e o relatório final.

---

# Parte V — Avançado

## 19. Segurança e Autonomia

### Como funciona o sistema de aprovações

No modo **Supervised** (padrão), o agente pede aprovação antes de executar qualquer ação que:

- Escreve ou modifica arquivos (`filesystem.write`, `filesystem.delete`)
- Executa comandos no shell (`shell.exec`)

Quando o agente pede aprovação, você vê um prompt com:

- O nome da ferramenta sendo usada
- O argumento exato (qual arquivo, qual comando)
- Um timer de expiração (120s por padrão)

### Configurando allowlists

As allowlists controlam o que o agente pode fazer:

```json
{
  "security": {
    "execution": {
      "allowedCommands": [
        "git",
        "node",
        "npm",
        "pnpm",
        "python",
        "pip",
        "docker",
        "docker-compose"
      ],
      "blockedCommands": ["rm", "del", "format", "mkfs", "dd"]
    },
    "filesystem": {
      "allowedPaths": ["./src", "./tests", "./docs", "./package.json"],
      "blockedPaths": ["/etc", "~/.ssh", ".env"]
    }
  }
}
```

> **Regra de segurança:** Comandos fora de `allowedCommands` são sempre bloqueados, independentemente do nível de autonomia. `blockedCommands` são bloqueados mesmo que estejam em `allowedCommands`.

### Modos de operação por autonomia

**Readonly:**

```
Agente: "Para criar o arquivo src/auth.ts com este conteúdo..."
Agente: [NÃO executa — apenas descreve o que faria]
```

**Supervised (padrão):**

```
Agente solicita aprovação → Você aprova → Agente executa
```

**Full:**

```
Agente executa diretamente → Informa o que fez
```

> **Recomendação:** Use `Supervised` durante o desenvolvimento. Use `Full` apenas em ambientes isolados e com tarefas bem definidas.

---

## 20. Memória e Contexto

### Como a memória funciona

O Inception armazena **todas as conversas** em um banco SQLite (`~/.inception/memory.db`) com:

- Busca por texto completo (FTS5) — recuperação por palavras-chave
- Busca vetorial (embeddings) — recuperação por similaridade semântica
- Compactação automática quando o histórico é muito longo

A cada mensagem, o agente:

1. Busca na memória por contexto relevante à conversa atual
2. Inclui esse contexto no prompt enviado ao modelo
3. Armazena a nova conversa para uso futuro

### Contexto de missão no system prompt

Quando há uma missão ativa, o system prompt do agente inclui automaticamente:

- Nome e descrição da missão
- Modo de operação (Auditor/Executor)
- Tasks pendentes
- Regras e restrições

Isso garante que o agente sempre saiba o que está fazendo e quais são as regras do projeto.

### Onde os dados ficam

| Dado                    | Localização                      |
| ----------------------- | -------------------------------- |
| Memória de conversas    | `~/.inception/memory.db`         |
| Banco de missões        | `~/.inception/missions.db`       |
| Cache de modelos        | `~/.inception/models-cache.json` |
| Relatórios gerados      | `~/.inception/reports/`          |
| Configuração do projeto | `<seu-projeto>/.inception.json`  |

---

## 21. Metodologia Inception (IMP/IEP/ISP)

O Inception implementa três protocolos metodológicos:

### IMP — Inception Mission Protocol

O protocolo de missão define o ciclo de vida de uma missão:

1. **Briefing** — definição do objetivo e escopo
2. **Decomposição** — quebrar em tarefas atômicas
3. **Execução** — agente opera dentro das regras da missão
4. **Arquivamento** — registro imutável no journal

### IEP — Inception Engineering Protocol

Protocolo de engenharia com **gates** de qualidade:

| Gate            | Código | Quando usar                         |
| --------------- | ------ | ----------------------------------- |
| TypeScript Gate | G-TS   | Antes de commitar código TypeScript |
| Design Gate     | G-DI   | Antes de iniciar uma feature nova   |
| Security Gate   | G-SEC  | Em qualquer mudança de segurança    |
| UX Gate         | G-UX   | Em mudanças de interface            |
| Release Gate    | G-REL  | Antes de publicar uma versão        |
| AI Gate         | G-AI   | Ao mudar comportamento do agente    |

### ISP — Inception Safety Protocol

Protocolo de segurança com níveis de autonomia e aprovações. É o que garante que o agente nunca faz nada sem sua permissão (no modo Supervised).

### Modos do Agente

| Modo      | Código | Quando o agente usa                   |
| --------- | ------ | ------------------------------------- |
| Auditor   | A      | Planejamento, análise, sem execução   |
| Executor  | B      | Implementação ativa                   |
| Archivist | C      | Consolidação e preservação no journal |
| Verifier  | D      | Apenas leitura — nunca modifica nada  |

A metodologia `Research-First` faz o agente iniciar no modo **A** (Auditor) — lê, pesquisa, planeja — e depois migra para **B** (Executor) quando o plano está pronto.

---

## 22. Auto-Update de Modelos

O sistema mantém um cache de modelos disponíveis para cada provider.

### Como funciona

- **Cache:** `~/.inception/models-cache.json` com TTL de 24 horas
- **`inception start`:** atualiza o cache em **background** (não bloqueia o boot)
- **`inception init`:** atualiza o cache de forma **síncrona** (mostra modelos atualizados no wizard)
- **Offline:** usa modelos hardcoded se a API não responder em 5 segundos

### Endpoints consultados por provider

| Provider        | Endpoint de modelos                   |
| --------------- | ------------------------------------- |
| Anthropic       | `GET /v1/models`                      |
| OpenAI          | `GET /v1/models`                      |
| Ollama          | `GET http://localhost:11434/api/tags` |
| Google Gemini   | `GET /v1beta/models`                  |
| OpenRouter      | `GET /v1/models`                      |
| Kimi / Moonshot | `GET /v1/models`                      |
| Z.AI            | `GET /api/paas/v4/models`             |
| Bailian         | `GET /compatible-mode/v1/models`      |

---

# Parte VI — Referência

## 23. Referência de Comandos CLI

Todos os comandos usam o binário `node apps/cli/dist/index.js`.

### Comandos de configuração

```bash
# Criar configuração inicial (.inception.json):
node apps/cli/dist/index.js init
node apps/cli/dist/index.js init --force   # sobrescreve configuração existente

# Ver configuração atual resolvida:
node apps/cli/dist/index.js config
node apps/cli/dist/index.js config --json  # formato JSON

# Verificar ambiente (provider, memória, configuração):
node apps/cli/dist/index.js status
```

### Comandos do agente

```bash
# Iniciar o agente (chat interativo):
node apps/cli/dist/index.js start

# Iniciar com provider específico:
node apps/cli/dist/index.js start --provider <slug>

# Iniciar com modelo específico:
node apps/cli/dist/index.js start --provider <slug> --model <modelo>

# Iniciar com banco de memória alternativo:
node apps/cli/dist/index.js start --memory /caminho/alternativo.db

# Iniciar em modo debug:
node apps/cli/dist/index.js start --debug
```

### Comandos de missão

```bash
# Criar nova missão (wizard interativo):
node apps/cli/dist/index.js mission create

# Listar todas as missões:
node apps/cli/dist/index.js mission list

# Iniciar agente com uma missão específica:
node apps/cli/dist/index.js mission start <id>
node apps/cli/dist/index.js mission start <id> --provider anthropic

# Ver status de missões:
node apps/cli/dist/index.js mission status         # todas as ativas
node apps/cli/dist/index.js mission status <id>    # uma específica

# Gerar relatório markdown:
node apps/cli/dist/index.js mission report         # mais recente
node apps/cli/dist/index.js mission report <id>    # específica

# Arquivar missão concluída:
node apps/cli/dist/index.js mission archive <id>
```

---

## 24. Referência de Slash Commands

Estes comandos funcionam **dentro do agente** (após `start` ou `mission start`).

| Comando              | Descrição                                           | Exemplo                                    |
| -------------------- | --------------------------------------------------- | ------------------------------------------ |
| `/help`              | Lista todos os slash commands                       | `/help`                                    |
| `/status`            | Estado do agente (provider, modelo, tokens, missão) | `/status`                                  |
| `/mission`           | Exibe missão ativa e tasks                          | `/mission`                                 |
| `/mission create`    | Inicia wizard de criação inline                     | `/mission create`                          |
| `/task list`         | Lista tasks pendentes da missão ativa               | `/task list`                               |
| `/task done <texto>` | Registra task como concluída                        | `/task done Autenticação JWT implementada` |
| `/task add <desc>`   | Adiciona nova task à missão                         | `/task add Implementar rate limiting`      |
| `/note <texto>`      | Registra nota no journal                            | `/note Decidimos usar Redis para sessões`  |
| `/rules`             | Exibe regras e metadados da missão                  | `/rules`                                   |
| `/pause`             | Encerra o agente graciosamente                      | `/pause`                                   |
| `/stop`              | Encerra o agente                                    | `/stop`                                    |
| `/exit`              | Encerra o agente                                    | `/exit`                                    |

---

## 25. Referência do .inception.json

Referência completa de todos os campos do arquivo de configuração:

```json
{
  "agent": {
    "name": "string", // Nome do agente na TUI
    "purpose": "string", // Propósito geral do agente
    "nature": "AI", // "AI" | "Human" | "Hybrid"
    "tone": "direct", // "direct" | "formal" | "friendly"
    "language": "pt-BR", // Idioma das respostas
    "values": [], // Valores operacionais (array de objetos)
    "limits": [] // Limites inegociáveis (array de objetos)
  },

  "operator": {
    "name": "string", // Seu nome ou papel
    "autonomyLevel": "Supervised", // "Readonly" | "Supervised" | "Full"
    "reportFrequency": "PerMission", // "PerTurn" | "PerMission" | "Manual"
    "reportFormat": "Markdown", // "Markdown" | "JSON"
    "contact": "string" // Contato do operador (opcional)
  },

  "defaultProvider": "string", // Slug do provider padrão

  "providers": {
    "<slug>": {
      "apiKey": "string", // Chave de API (obrigatório para providers cloud)
      "baseUrl": "string" // URL base da API (opcional)
    }
  },

  "security": {
    "network": {
      "allowedHosts": [], // Hosts permitidos para requisições
      "blockedHosts": [], // Hosts bloqueados
      "allowedPorts": [443, 80]
    },
    "filesystem": {
      "allowedPaths": [], // Caminhos que o agente pode acessar
      "blockedPaths": [], // Caminhos sempre bloqueados
      "maxFileSize": 10485760, // Tamanho máximo de arquivo (bytes)
      "blockedExtensions": [".exe", ".bat"]
    },
    "execution": {
      "allowedCommands": [], // Comandos que o agente pode executar
      "blockedCommands": [], // Comandos sempre bloqueados
      "maxExecutionTime": 30000 // Timeout em ms
    },
    "rateLimit": {
      "requestsPerMinute": 60,
      "requestsPerHour": 1000
    }
  },

  "logging": {
    "level": "info", // "debug" | "info" | "warn" | "error"
    "file": "string" // Caminho do arquivo de log (opcional)
  },

  "projects": [] // Referências a outros projetos (futuro)
}
```

---

## 26. FAQ e Troubleshooting

### Erro: `Cannot find module 'sqlite'`

**Causa:** Versão do Node.js abaixo de 22. O módulo `node:sqlite` é nativo apenas no Node 22+.

**Solução:**

```bash
node --version   # Confirme que é v22+
# Se for v20 ou v21, atualize para v22
```

### Erro: `Cannot find package 'sqlite'`

**Causa:** Idêntica à anterior. Node.js < 22.

### Erro: `Nenhum arquivo de configuração encontrado`

**Causa:** O `.inception.json` não existe no diretório atual ou nos diretórios pai.

**Solução:**

```bash
# Certifique-se de estar na pasta correta:
ls .inception.json    # deve existir

# Se não existir, crie:
node apps/cli/dist/index.js init
```

### Erro: `Cannot find module 'D:\...\inception-v2\apps\cli\dist\index.js'`

**Causa:** Caminho incorreto no comando. Você está em `inception-v2-rabelus/ai-auctions` tentando acessar `../inception-v2/apps/cli/...` — o caminho extra `inception-v2` não existe.

**Solução:**

```bash
# Estando em: D:\Sandbox\inception-v2-rabelus\ai-auctions\
node ../apps/cli/dist/index.js start
#     ^^^ sem o "inception-v2/" extra
```

### Erro: `Invalid config file at ...`

**Causa:** O `.inception.json` tem JSON inválido ou campos incorretos.

**Solução:**

```bash
# Valide o JSON:
cat .inception.json | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{JSON.parse(d);console.log('JSON válido')}catch(e){console.error('JSON inválido:',e.message)}})"

# Ou recrie:
node apps/cli/dist/index.js init --force
```

### Erro: `Provider init error: API key not found`

**Causa:** A chave de API não está configurada.

**Solução:**

```json
// No .inception.json, adicione:
{
  "providers": {
    "kimi": {
      "apiKey": "sua-chave-aqui"
    }
  }
}
```

### O agente não responde / trava

**Causa:** Timeout do provider, problema de rede, ou rate limit.

**Solução:**

- Pressione `Ctrl+C` para sair
- Verifique sua conexão com a internet
- Verifique se a chave de API está válida
- Tente com `--provider ollama` para testar localmente

### O wizard de missão encerrou sem criar a missão

**Causa:** Validação falhou (nome muito curto, descrição muito curta).

**Comportamento correto:** O wizard reinicia do passo 1 mostrando os erros.

**Se voltou ao chat normal:** Pode ter ocorrido um bug. Use `/mission create` novamente.

### Após criar a missão no wizard inline, o agente não a reconhece

**Causa:** O `AgentLoop` é inicializado com a missão no boot e não se atualiza mid-session automaticamente.

**Solução:** Após criar a missão inline, encerre e reinicie o agente com:

```bash
node apps/cli/dist/index.js mission start <id-da-missão>
```

### `pnpm build` falha com erros TypeScript

**Causa:** Código fonte com erros ou dependências desatualizadas.

**Solução:**

```bash
# Limpar e reinstalar:
pnpm clean
pnpm install
pnpm build
```

### O agente não está em português

**Causa:** O campo `language` não foi configurado como `pt-BR`.

**Solução:** No `.inception.json`:

```json
{
  "agent": {
    "language": "pt-BR",
    "tone": "direct"
  }
}
```

---

## 27. Glossário

**Agent Loop (ReAct):** O ciclo de operação do agente: Raciocinar → Agir → Observar → Raciocinar novamente. Cada turn do loop é uma interação completa com o modelo de linguagem.

**Allowlist:** Lista de comandos ou caminhos que o agente tem permissão para usar. Tudo fora da allowlist é bloqueado automaticamente.

**Autonomy Level (Nível de Autonomia):** Controla quanto o agente pode fazer sem pedir aprovação. Valores: `Readonly`, `Supervised`, `Full`.

**Canal (Channel):** Interface de comunicação entre o operador e o agente. Atualmente: CLI (terminal). Futuro: Telegram, HTTP.

**Context Builder:** Componente interno que monta o system prompt do agente, incluindo identidade, missão ativa, memória relevante e data atual.

**DTS (Declaration TypeScript):** Arquivos `.d.ts` gerados pelo TypeScript que descrevem os tipos exportados. Necessários para que outros pacotes usem as tipagens corretamente.

**ESM (ECMAScript Modules):** Formato de módulo JavaScript moderno, usado por todo o framework (`import`/`export`). Requerido pelo Node 22+.

**FTS5:** Full-Text Search versão 5 — extensão do SQLite para busca por texto completo. Usada pela memória do agente.

**Gate (Portão):** Verificação formal de qualidade no IEP. Gates garantem que certas condições são atendidas antes de avançar no desenvolvimento.

**IEP (Inception Engineering Protocol):** Protocolo de engenharia com gates de qualidade e status de tarefas.

**IMP (Inception Mission Protocol):** Protocolo de missão que define o ciclo briefing → execução → arquivamento.

**ISP (Inception Safety Protocol):** Protocolo de segurança com autonomia e aprovações.

**Journal:** Registro imutável e cronológico do que aconteceu durante uma missão. Armazenado em SQLite, nunca pode ser editado após arquivamento.

**Memória (Memory Backend):** Sistema de armazenamento persistente de conversas. Usa SQLite com FTS5 e busca vetorial.

**Missão:** Contexto completo de trabalho que configura o agente para um objetivo específico. Inclui objetivo, stack, metodologia, skills, autonomia, regras e tarefas.

**Modo do Agente:** Como o agente opera: Auditor (A) = análise, Executor (B) = implementação, Archivist (C) = consolidação, Verifier (D) = somente leitura.

**Monorepo:** Repositório único contendo múltiplos pacotes relacionados. O Inception usa pnpm workspaces + Turborepo.

**Operador:** Você — a pessoa humana que controla o agente.

**Provider:** Serviço de IA que alimenta o agente (Anthropic, OpenAI, Kimi, etc.).

**ReAct:** Padrão de raciocínio de agentes: Reason (Raciocinar) + Act (Agir). O agente raciocina sobre o que fazer, age, observa o resultado, e raciocina novamente.

**Slash Command:** Comando especial prefixado com `/` digitado no chat. Processado diretamente pelo sistema, não enviado ao modelo de linguagem.

**SQLite:** Banco de dados relacional embutido, usado para memória, missões e journal do Inception.

**System Prompt:** Instrução base enviada ao modelo de linguagem antes de qualquer mensagem do usuário. Inclui identidade do agente, missão ativa, valores e limites.

**Task (Tarefa):** Unidade de trabalho dentro de uma missão. Tem estados: pending, in_progress, completed, blocked, skipped.

**Tool (Ferramenta):** Ação que o agente pode executar: ler arquivo, escrever arquivo, executar comando, fazer requisição HTTP, buscar na memória.

**TSup:** Bundler TypeScript usado para compilar os pacotes. Gera saída ESM com source maps e declarações de tipos.

**Turborepo:** Ferramenta de build para monorepos que gerencia dependências entre pacotes e cache de builds.

**Turn:** Uma rodada completa de interação: você envia uma mensagem → agente processa → agente responde. Pode incluir múltiplas chamadas de tools.

**Wizard:** Interface interativa de perguntas e respostas para configuração (init, mission create). Guia o usuário passo a passo.

---

_Guia mantido pela equipe Rabelus Lab — Inception Framework v2.0_
_Última atualização: 2026-03-23_
_Para reportar erros ou sugerir melhorias: abra uma issue no repositório_
