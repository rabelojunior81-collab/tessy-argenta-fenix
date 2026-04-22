#!/bin/bash

# Script para configurar o ambiente de produção de vídeo com Remotion

# 1. Atualizar pacotes e instalar dependências do sistema
echo "--- Atualizando pacotes e instalando dependências do sistema... ---"
sudo apt-get update -y
sudo apt-get install -y curl build-essential libssl-dev libvips-dev ffmpeg

# 2. Instalar Node.js e npm (se não existirem)
if ! command -v node &> /dev/null
then
    echo "--- Node.js não encontrado. Instalando... ---"
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Instalar pnpm globalmente
echo "--- Instalando pnpm... ---"
sudo npm install -g pnpm

# 4. Instalar dependências do projeto Remotion
# (Assumindo que o package.json estará no mesmo diretório)
echo "--- Instalando dependências do projeto com pnpm... ---"
# O comando 'pnpm install' deve ser executado no diretório que contém o package.json
# Este script apenas prepara o ambiente. A instalação das dependências do projeto
# deve ser feita pelo agente após a criação do projeto Remotion.

echo "--- Ambiente configurado com sucesso! ---"
echo "Lembre-se de criar o arquivo .env com a sua GEMINI_API_KEY."
