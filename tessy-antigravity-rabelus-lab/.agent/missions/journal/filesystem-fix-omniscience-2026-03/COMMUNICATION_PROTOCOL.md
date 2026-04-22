# COMMUNICATION PROTOCOL
## Missao: filesystem-fix-omniscience-2026-03

## Canais
- Claude Code (este agente) → Adilson (operador)

## Checkpoints obrigatórios
1. Antes de instalar pacotes e modificar vite.config.ts → apresentar plano (✓ já apresentado)
2. Após Gate G1 (tsc) → reportar resultado
3. Antes de merge → aprovação explícita do operador

## Bloqueios
- Qualquer falha de tsc deve ser relatada antes de prosseguir
- Modificações em arquivos fora do escopo devem ser consultadas

## Aprovações necessárias
- Merge da feature branch → merge manual pelo operador ou aprovação explícita para Claude fazer
