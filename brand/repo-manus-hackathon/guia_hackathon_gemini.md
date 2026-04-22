# Guia Completo para o Gemini Live Agent Challenge

## Introdução

O **Gemini Live Agent Challenge** é uma competição de desenvolvimento de software (hackathon) que desafia os participantes a transcender as interações tradicionais de chatbot baseadas em texto. O objetivo é construir a próxima geração de agentes de Inteligência Artificial (IA) que utilizam múltiplas modalidades de entrada e saída, como áudio e vídeo, para criar experiências imersivas e resolver problemas complexos. A competição é uma iniciativa do Google, organizada na plataforma Devpost, e oferece um total de **$80.000 em prêmios**.

Este guia consolida todas as informações essenciais que você precisa para entender o desafio, preparar seu projeto e realizar sua submissão com sucesso.

## Elegibilidade e Inscrição

Para participar do hackathon, os desenvolvedores devem atender a critérios específicos de elegibilidade e seguir o processo de inscrição detalhado.

| Critério | Detalhes |
| :--- | :--- |
| **Idade** | Ser maior de idade legal em seu país de residência (ou pelo menos 20 anos em Taiwan). |
| **Residência** | O concurso é aberto a residentes de quase todos os países, com exceção de Itália, Quebec, Crimeia, Cuba, Irã, Síria, Coreia do Norte, Sudão, Bielorrússia e Rússia. |
| **Restrições** | Não ser funcionário de agências governamentais e não estar sob sanções ou controles de exportação dos EUA. Funcionários do Google, Devpost e outras organizações envolvidas no evento são inelegíveis. |
| **Inscrição** | A inscrição é gratuita e deve ser feita através do site do Devpost, clicando no botão "Join hackathon". É necessário ter uma conta na plataforma. |

## Cronograma do Desafio

O hackathon possui um cronograma definido, com datas e horários no fuso horário do Pacífico (PT). É crucial que os participantes convertam esses horários para suas respectivas localidades.

| Evento | Data e Horário (PT) |
| :--- | :--- |
| **Início do Período de Submissão** | 16 de fevereiro de 2026, 09:00 AM |
| **Fim do Período de Submissão** | 16 de março de 2026, 05:00 PM |
| **Período de Julgamento** | 17 de março de 2026 a 03 de abril de 2026 |
| **Anúncio dos Vencedores** | Entre 22 e 24 de abril de 2026, durante o Google NEXT 2026 |

## Categorias e Requisitos do Projeto

Os participantes devem desenvolver um **novo agente de IA** que se enquadre em uma das três categorias propostas, utilizando obrigatoriamente modelos Gemini, o SDK Google GenAI ou o ADK (Agent Development Kit), e pelo menos um serviço do Google Cloud.

### Categorias de Projeto

| Categoria | Foco | Descrição e Exemplos |
| :--- | :--- | :--- |
| **Live Agents 🗣️** | Interação em Tempo Real (Áudio/Visão) | Crie agentes com os quais os usuários possam conversar naturalmente, permitindo interrupções. Exemplos incluem tradutores em tempo real, tutores personalizados que "enxergam" o material de estudo ou agentes de suporte por voz. |
| **Creative Storyteller ✍️** | Narrativa Multimodal com Saída Intercalada | Desenvolva agentes que atuem como diretores criativos, combinando texto, imagens, áudio e vídeo em um único fluxo de saída. Exemplos incluem livros de histórias interativos, geradores de conteúdo de marketing ou explicadores educacionais. |
| **UI Navigator ☸️** | Compreensão e Interação Visual com a Interface | Construa agentes que interajam com interfaces de usuário (navegadores, aplicativos) a partir da observação visual, sem depender de APIs ou acesso ao DOM. Exemplos incluem navegadores web universais ou agentes de teste de QA visual. |

### Requisitos de Submissão

Para que o projeto seja avaliado, a submissão deve incluir os seguintes itens:

1.  **Descrição em Texto**: Um resumo detalhado do projeto, suas funcionalidades, as tecnologias utilizadas e os aprendizados obtidos.
2.  **Repositório de Código Público**: A URL para um repositório de código (como o GitHub) que contenha todo o código-fonte do projeto, incluindo um arquivo `README.md` com instruções claras para a sua execução.
3.  **Prova de Implantação no Google Cloud**: Uma demonstração de que o backend da aplicação está rodando no Google Cloud. Isso pode ser feito através de uma gravação de tela ou um link para um arquivo de código que comprove o uso dos serviços da nuvem do Google.
4.  **Diagrama de Arquitetura**: Uma representação visual clara da arquitetura do sistema, mostrando a interconexão entre o Gemini, o backend, o banco de dados e o frontend.
5.  **Vídeo de Demonstração**: Um vídeo com menos de 4 minutos que demonstre as funcionalidades do agente em tempo real e apresente a proposta de valor da solução.

## Critérios de Julgamento e Prêmios

Os projetos serão avaliados por um painel de juízes com base em três critérios principais. Os vencedores receberão prêmios em dinheiro, créditos do Google Cloud e outras oportunidades.

### Critérios de Avaliação

| Critério | Peso | Descrição |
| :--- | :--- | :--- |
| **Inovação e Experiência do Usuário Multimodal** | 40% | Avalia se o projeto quebra o paradigma da "caixa de texto", oferecendo uma experiência de interação fluida e contextualizada. |
| **Implementação Técnica e Arquitetura do Agente** | 30% | Analisa o uso eficaz do SDK ou ADK, a robustez do backend no Google Cloud, a lógica do agente e o tratamento de erros. |
| **Demonstração e Apresentação** | 30% | Considera a clareza do vídeo de demonstração na definição do problema e da solução, a clareza do diagrama de arquitetura e a prova de funcionamento do software. |

### Estrutura de Prêmios

| Prêmio | Valor em Dinheiro | Detalhes Adicionais |
| :--- | :--- | :--- |
| **Grande Prêmio** | $25.000 | $3.000 em créditos do Google Cloud, café virtual com a equipe do Google, ingressos e despesas de viagem para o Google Cloud Next 2026. |
| **Melhor de cada Categoria** | $10.000 (x3) | $1.000 em créditos do Google Cloud, café virtual com a equipe do Google e ingressos para o Google Cloud Next 2026. |
| **Outros Prêmios** | $2.000 - $5.000 | Prêmios para Melhor Integração Multimodal, Melhor Execução Técnica, Melhor Inovação e Menções Honrosas. |

## Recursos e Suporte

Para auxiliar os desenvolvedores, o hackathon disponibiliza uma série de recursos, incluindo notebooks, exemplos de código, guias de desenvolvimento e demonstrações em vídeo. Os participantes podem solicitar créditos do Google Cloud para desenvolver seus projetos e são incentivados a se juntar a um Google Developer Group (GDG) para obter pontos de bônus.

Para mais informações, consulte as seções de **Recursos** e **Regras** na página oficial do hackathon.

## Conclusão

O Gemini Live Agent Challenge representa uma oportunidade única para desenvolvedores explorarem o potencial da IA multimodal e criarem soluções inovadoras que redefinem a interação homem-máquina. Ao seguir este guia, você estará bem preparado para embarcar nesta jornada de desenvolvimento e competir por prêmios e reconhecimento significativos.

---

**Referências:**

[1] [Gemini Live Agent Challenge - Devpost](https://geminiliveagentchallenge.devpost.com/)
[2] [Gemini Live Agent Challenge - Rules](https://geminiliveagentchallenge.devpost.com/rules)
[3] [Gemini Live Agent Challenge - Resources](https://geminiliveagentchallenge.devpost.com/resources)
