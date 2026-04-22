# GitLab AI Hackathon — Submissão do Projeto Tessy

---

### 🇧🇷 About the project — Português

```markdown
## Inspiração

A minha inspiração veio da frustração com a fragmentação do desenvolvimento moderno. Ferramentas de IA que não entendem o contexto completo do projeto, terminais em janelas separadas, documentação desatualizada — tudo isso cria atrito. Eu queria construir um ambiente onde a IA não fosse apenas um "assistente", mas uma **extensão cognitiva** do desenvolvedor. Um Córtex Externo.

## O que eu construí

Construí a **Tessy**, uma plataforma de Hiper-Engenharia Assistida por IA. Ela não é apenas um editor de código — é um ambiente de desenvolvimento completo, Local-First, que integra:

1.  **CoPilot "Antigravity"**: Um assistente de IA multimodal (Gemini + Claude) que tem **onisciência do workspace**. Ele lê, entende e interage com todo o seu projeto localmente, garantindo privacidade e contexto profundo.
2.  **Terminal Quântico**: Um terminal real (não simulado) integrado à interface, com `node-pty` e `xterm.js`, permitindo execução de código e comandos no mesmo fluxo de trabalho.
3.  **Arquitetura Molecular**: Cada componente é uma célula independente, permitindo uma evolução e manutenção ágil e robusta.
4.  **Integração com GitLab (para este hackathon)**: A Tessy age como um agente autônomo que pode ser acionado por eventos do GitLab (via webhooks) para realizar tarefas como:
    *   **Análise de Merge Request**: O agente clona a branch, analisa as mudanças, roda testes com Vitest e comenta no MR com um relatório de qualidade.
    *   **Auto-Documentação**: Em cada push para a `main`, o agente gera ou atualiza a documentação do projeto com base no diff do código.
    *   **Análise de Segurança**: Usando o Gemini Pro, o agente escaneia o código por vulnerabilidades conhecidas e abre uma issue no GitLab se encontrar algo crítico.

## Como eu construí

O coração da Tessy é uma arquitetura **Local-First** com React 19, TypeScript e Vite. A "onisciência" do workspace é alcançada com a **File System Access API**. O terminal integrado usa **`node-pty`** e **`xterm.js`** sobre WebSockets. A camada de IA é agnóstica, usando o **Vercel AI SDK** para orquestrar chamadas para **Gemini Pro** (análise de código, documentação) e **Google Cloud** (para a integração com o GitLab).

Para este hackathon, a integração com o GitLab foi feita usando **webhooks** que acionam um **servidor Hono** rodando no **Google Cloud**. Esse servidor então se comunica com a instância local da Tessy (ou uma instância cloud) para delegar a tarefa ao agente de IA apropriado.
```

---

### 🇺🇸 About the project — English

```markdown
## Inspiration

My inspiration came from the frustration with the fragmentation of modern development. AI tools that don't understand the full project context, terminals in separate windows, outdated documentation—all of this creates friction. I wanted to build an environment where AI wasn't just an "assistant," but a **cognitive extension** of the developer. An External Cortex.

## What I built

I built **Tessy**, an AI-Assisted Hyper-Engineering platform. It's not just a code editor—it's a complete, Local-First development environment that integrates:

1.  **"Antigravity" CoPilot**: A multimodal AI assistant (Gemini + Claude) with **workspace omniscience**. It reads, understands, and interacts with your entire project locally, ensuring privacy and deep context.
2.  **Quantum Terminal**: A real (not simulated) terminal integrated into the interface, with `node-pty` and `xterm.js`, allowing code execution and commands in the same workflow.
3.  **Molecular Architecture**: Each component is an independent cell, enabling agile and robust evolution and maintenance.
4.  **GitLab Integration (for this hackathon)**: Tessy acts as an autonomous agent that can be triggered by GitLab events (via webhooks) to perform tasks such as:
    *   **Merge Request Analysis**: The agent clones the branch, analyzes the changes, runs tests with Vitest, and comments on the MR with a quality report.
    *   **Auto-Documentation**: On each push to `main`, the agent generates or updates the project documentation based on the code diff.
    *   **Security Analysis**: Using Gemini Pro, the agent scans the code for known vulnerabilities and opens an issue in GitLab if it finds anything critical.

## How I built it

The core of Tessy is a **Local-First** architecture with React 19, TypeScript, and Vite. Workspace "omniscience" is achieved with the **File System Access API**. The integrated terminal uses **`node-pty`** and **`xterm.js`** over WebSockets. The AI layer is provider-agnostic, using the **Vercel AI SDK** to orchestrate calls to **Gemini Pro** (code analysis, documentation) and **Google Cloud** (for the GitLab integration).

For this hackathon, the GitLab integration was done using **webhooks** that trigger a **Hono server** running on **Google Cloud**. This server then communicates with the local Tessy instance (or a cloud instance) to delegate the task to the appropriate AI agent.
```

---

### Built with

```text
GitLab Duo Agent Platform, Google Cloud, Gemini Pro, Vercel AI SDK, React 19, TypeScript, Vite, Tailwind CSS, Monaco Editor, xterm.js, node-pty, Hono, File System Access API, IndexedDB, Vitest, Playwright
```
