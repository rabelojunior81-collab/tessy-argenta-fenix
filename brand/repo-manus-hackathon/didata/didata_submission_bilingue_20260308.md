# Devpost Submission — Didata by Rabelus Lab
## Bilíngue / Bilingual (PT-BR | EN)

---

## Campo: About the project

---

### 🇧🇷 Português

```markdown
## Inspiração

Minha inspiração veio da frustração com o aprendizado passivo. Eu queria transformar a leitura de textos densos e livros complexos — que muitas vezes é uma jornada solitária — em uma conversa dinâmica e interativa. A ideia era simples: e se pudéssemos "conversar com o conhecimento"?

## O que eu construí

Construí o **Didata**, um Arquiteto Pedagógico de IA. Ele não é apenas mais um chatbot. O Didata consome conteúdo bruto e estático (como um PDF ou texto longo) e o reconstrói como um curso estruturado, com módulos e aulas sequenciais. O diferencial é o seu "Tutor Socrático": um agente de IA com quem você pode conversar por voz em tempo real, usando a Gemini Live API. Você pode interrompê-lo, fazer perguntas e ser guiado através do conteúdo — transformando o estudo em um diálogo ativo.

## Como eu construí

O coração do projeto é a **Gemini Live API**, que possibilita a interação por voz fluida e em tempo real. Para a estruturação do conteúdo, utilizei o **Gemini Pro**, que analisa o material bruto e o organiza em uma estrutura pedagógica. A interface foi desenvolvida com **React, TypeScript e Vite**, focando em uma experiência de usuário limpa e responsiva. Para garantir privacidade e velocidade, todos os dados do usuário são armazenados localmente no navegador via **IndexedDB**.

## Desafios que enfrentei

O principal desafio foi duplo: técnico e conceitual. Tecnicamente, otimizar a arquitetura para minimizar a latência da conversação por voz foi crucial para que a interação parecesse natural. Conceitualmente, o desafio foi projetar o prompt e a lógica do "Tutor Socrático" para que ele agisse como um verdadeiro guia — fazendo perguntas, provocando o raciocínio — em vez de simplesmente entregar respostas prontas.
```

---

### 🇺🇸 English

```markdown
## Inspiration

My inspiration came from the frustration with passive learning. I wanted to transform the reading of dense texts and complex books — often a solitary journey — into a dynamic and interactive conversation. The idea was simple: what if we could "talk to knowledge"?

## What I built

I built **Didata**, an AI Pedagogical Architect. It is not just another chatbot. Didata consumes raw, static content (such as a PDF or a long text) and reconstructs it as a structured course, with logical modules and sequential lessons. The key differentiator is its "Socratic Tutor": an AI agent you can talk to by voice in real time, powered by the Gemini Live API. You can interrupt it, ask questions, and be guided through the content — turning studying into an active dialogue.

## How I built it

The heart of the project is the **Gemini Live API**, which enables fluid, real-time voice interaction. For content structuring, I used **Gemini Pro** to analyze raw material and organize it into a pedagogical framework. The interface was built with **React, TypeScript, and Vite**, focusing on a clean and responsive user experience. To ensure privacy and speed, all user data is stored locally in the browser via **IndexedDB**.

## Challenges I faced

The main challenge was twofold: technical and conceptual. On the technical side, optimizing the architecture to minimize voice conversation latency was critical to making the interaction feel natural. On the conceptual side, the challenge was designing the prompt and logic of the "Socratic Tutor" so it would act as a true guide — asking questions, provoking reasoning — rather than simply delivering ready-made answers.
```

---

## Campo: Built with

```text
Gemini Live API, Gemini Pro, Google AI SDK, Google Cloud, React, TypeScript, Vite, Tailwind CSS, IndexedDB
```
