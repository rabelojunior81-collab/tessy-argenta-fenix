# Getting Started

Este guia cobre o caminho mais curto para subir a Tessy e encontrar o shell principal depois da Fase 1.

---

## Pré-requisitos

- Node.js instalado
- `npm`
- um workspace local para a aba `Files` quando você quiser editar arquivos reais
- o broker local do terminal, se você quiser uma sessão PTY de verdade

---

## Instalação

```bash
npm install
```

---

## Subindo a aplicação

```bash
npm run dev
```

Em outro terminal:

```bash
npm run terminal
```

Ou tudo junto:

```bash
npm start
```

---

## O Que Você Deve Ver

- barra superior com o nome Tessy
- sidebar com viewers
- canvas central com o estado inicial do projeto
- terminal `Terminal Quantico` na parte inferior
- terminal offline até você conectar manualmente ao broker

---

## Navegação Básica

- `Files` abre arquivos locais do workspace
- `GitHub Sync` abre arquivos remotos em modo somente leitura
- `History`, `Library` e `Projects` mantêm a navegação leve via URL
- a URL acompanha o viewer ativo, então você pode usar refresh sem perder o contexto do painel

---

## Abrindo Arquivos

Quando um arquivo local é muito grande, a Tessy mostra um aviso antes de abrir.

Você pode escolher:

- abrir normalmente
- abrir em modo seguro

No modo seguro, o arquivo permanece somente leitura e o editor reduz recursos pesados.

---

## Terminal

O terminal não conecta sozinho.

Para iniciar a sessão real:

1. suba o broker com `npm run terminal`
2. clique em `Connect` no terminal
3. use `Disconnect` quando terminar

Se o broker estiver fora do ar, a interface mostra a instrução correta no próprio painel.

---

## Próximo Passo

Se a intenção for desenvolver, leia também:

- [`development.md`](development.md)
- [`testing.md`](testing.md)
- [`configuration.md`](configuration.md)
