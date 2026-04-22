# Skill: Produção de Vídeo com Remotion e IA

Esta skill capacita um agente de IA a criar vídeos de qualidade profissional de forma programática, utilizando o framework Remotion, React e APIs de IA da Gemini para geração de narração e conteúdo.

## 1. Visão Geral

O objetivo desta skill é automatizar a criação de vídeos, como teasers, apresentações e tutoriais, combinando ativos visuais (imagens, clipes de vídeo) com narração gerada por IA, legendas sincronizadas e transições suaves.

**Tecnologias Utilizadas:**

- **Remotion:** Framework baseado em React para criar vídeos programaticamente com tecnologias web (HTML, CSS, JavaScript).
- **React:** Biblioteca para construir as cenas e animações do vídeo como componentes.
- **TypeScript:** Para um desenvolvimento robusto e tipado.
- **Gemini API:** Para geração de narração (Text-to-Speech) e, futuramente, outros conteúdos de IA.
- **Node.js:** Ambiente de execução para o Remotion.

## 2. Configuração do Ambiente (Setup)

Para utilizar esta skill, o ambiente precisa ser configurado uma única vez. Siga os passos abaixo.

### Passo 1: Instalar Dependências

Execute o script `setup.sh` para instalar todas as dependências necessárias, incluindo o Node.js, as bibliotecas do sistema para renderização e os pacotes do projeto via `pnpm`.

```bash
./setup.sh
```

### Passo 2: Configurar a Chave de API

Esta skill requer uma chave de API do Gemini para gerar a narração. **Você deve solicitar a chave ao usuário APENAS UMA VEZ.**

1.  Crie uma cópia do arquivo `.env.example` e renomeie-a para `.env`.
2.  Abra o arquivo `.env` e insira a chave da API do Gemini fornecida pelo usuário.

```
# .env

GEMINI_API_KEY="SUA_CHAVE_DE_API_AQUI"
```

O agente NUNCA deve exibir o conteúdo do arquivo `.env` ou a chave da API em qualquer saída ou log.

## 3. Estrutura do Projeto

O projeto Remotion segue uma estrutura padrão:

- **`/public`**: Diretório para todos os ativos estáticos (imagens, vídeos, áudios, fontes). Coloque todos os seus arquivos de mídia aqui.
- **`/src`**: Contém todo o código-fonte da composição de vídeo.
  - **`Composition.tsx`**: O arquivo principal onde as cenas do vídeo são definidas e animadas.
  - **`Root.tsx`**: O ponto de entrada do Remotion, onde as composições são registradas.
  - **`/templates`**: Contém componentes React reutilizáveis para cenas comuns (ex: Título, Infográfico, Revelação).

## 4. Fluxo de Trabalho para Criação de Vídeo

Siga este fluxo para criar um novo vídeo.

### Passo 1: Preparar os Ativos

- Colete todas as imagens, clipes de vídeo curtos e arquivos de áudio (trilha sonora).
- Mova todos esses arquivos para o diretório `/public`.
- **Recomendação:** Use nomes de arquivo semânticos (ex: `shot1_frustration.png`, `background_music.mp3`).

### Passo 2: Gerar a Narração (TTS)

- Utilize a API do Gemini para converter o roteiro do vídeo em um arquivo de áudio (`.wav` ou `.mp3`).
- Salve o arquivo de narração gerado em `/public/narration.mp3`.

### Passo 3: Compor o Vídeo

- Abra o arquivo `src/Composition.tsx`.
- Utilize os componentes de template de `/src/templates` para construir a linha do tempo do seu vídeo.
- O Remotion usa a função `useCurrentFrame()` para saber o quadro atual e `interpolate()` para animar propriedades (opacidade, posição, etc.) ao longo do tempo.

**Exemplo de uma Cena:**

```tsx
import { Sequence } from 'remotion';
import { TitleScreen } from './templates/TitleScreen';

export const MyVideo: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={90}>
        <TitleScreen title="Olá, Remotion!" />
      </Sequence>
      {/* Outras sequências aqui... */}
    </>
  );
};
```

### Passo 4: Adicionar Legendas

- O Remotion permite adicionar legendas sincronizadas com o áudio. Utilize a função `useAudioData` para analisar o volume do áudio e animar a aparência das palavras.
- Existem templates pré-construídos para facilitar a criação de legendas dinâmicas.

### Passo 5: Renderizar o Vídeo

Após finalizar a composição, use o Remotion CLI para renderizar o vídeo em um arquivo MP4.

```bash
pnpm remotion render src/index.ts MyComposition out/video.mp4
```

- `MyComposition` é o ID da composição que você registrou em `src/Root.tsx`.
- `out/video.mp4` é o caminho do arquivo de saída.

## 5. Boas Práticas

- **Componentização:** Crie componentes React para cada cena ou elemento reutilizável.
- **Animação Suave:** Use as funções de easing do Remotion (`ease`, `linear`, etc.) para criar animações mais naturais.
- **Performance:** Para composições complexas, considere renderizar em formato de sequência de imagens (`.png`) e depois compilar em um vídeo com `ffmpeg`.
- **Segurança:** JAMAIS exponha a chave da API do Gemini. Sempre a leia a partir do arquivo `.env` no ambiente de execução.
