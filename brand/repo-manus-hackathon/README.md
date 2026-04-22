# Repositório Canônico: Ativos e Skills para Hackathons de IA

**Gerenciado por:** Manus AI
**Data de Criação:** 10 de Março de 2026

## Visão Geral

Este repositório serve como um hub centralizado para todos os ativos, documentação e skills reutilizáveis criados durante a preparação para os hackathons **Gemini Live Agent Challenge** e **GitLab AI Hackathon**. O objetivo é manter um registro organizado e canônico de todo o trabalho, permitindo uma "arqueologia inteligente" e a reutilização de componentes em projetos futuros.

## Estrutura do Repositório

-   **/didata**: Contém todos os ativos relacionados ao projeto **Didata**, submetido ao Gemini Live Agent Challenge.
-   **/tessy**: Contém todos os ativos relacionados ao projeto **Tessy**, submetido ao GitLab AI Hackathon.
-   **/skills**: Contém skills reutilizáveis desenvolvidas durante o processo.
    -   **/video-production-remotion**: Uma skill completa para criar vídeos de qualidade profissional de forma programática usando Remotion e a API Gemini.
-   `MANIFEST.md`: Um documento de mapeamento que cataloga cada ativo no repositório, detalhando seu propósito, timestamp e localização original.
-   `SESSION_JOURNAL.md`: Um diário de bordo narrativo que documenta toda a sessão de trabalho, incluindo decisões estratégicas, sucessos e falhas críticas.
-   `README.md`: Este arquivo, fornecendo uma orientação geral sobre o repositório.

## Como Utilizar

### Navegando pelos Ativos

Consulte o `MANIFEST.md` para uma visão completa de todos os arquivos disponíveis, seus nomes semânticos e seus propósitos. Os ativos estão organizados por projeto nos diretórios `didata/` e `tessy/`.

### Utilizando a Skill de Produção de Vídeo

A skill `video-production-remotion` é um framework poderoso para qualquer agente de IA criar vídeos. Para utilizá-la:

1.  Navegue até o diretório `/skills/video-production-remotion`.
2.  Leia e siga as instruções detalhadas no arquivo `SKILL.md`.
3.  Execute o script `setup.sh` para configurar o ambiente (necessário apenas uma vez).
4.  Configure sua chave de API do Gemini no arquivo `.env`.
5.  Comece a criar vídeos incríveis!

## Histórico e Contexto

Este repositório nasceu de uma necessidade de organizar os materiais de submissão para múltiplos hackathons e, crucialmente, de uma falha na produção de um vídeo que levou a um pivô estratégico. Em vez de uma correção pontual, optou-se por construir uma solução robusta e reutilizável, encapsulada na skill de produção de vídeo. Para entender a jornada completa, leia o `SESSION_JOURNAL.md`.
