# Rabelus Lab Governance Canon

## Objetivo

Definir a forma oficial de desenvolvimento da Tessy e dos produtos do Rabelus Lab, elevando o barramento de missões para uma metodologia de produto, engenharia, segurança e documentação.

## Camadas

### 1. TDP

O `Tessy Dev Protocol` é a camada metodológica principal. Ele define:

- missão antes de código;
- rastreabilidade entre intenção, implementação e validação;
- status técnico explícito por subsistema;
- governança de IA, persistência, segurança e rollout.

### 2. TSP

O fluxo seguro de branch, pre-flight, validação e rollback continua existindo como trilho operacional. O TSP passa a ser tratado como a camada de execução segura do TDP.

### 3. Journal

Toda documentação histórica, auditorias, incidentes, relatos de missão e decisões arquiteturais passam a compor um journal preservado. O journal não é lixo histórico; ele é memória institucional.

## Status padronizado

Todo subsistema relevante deve ser classificado em um destes estados:

- `RESOLVIDO`
- `PARCIAL`
- `STUB`
- `RISCO ACEITO`
- `BLOQUEADO`

## Gates obrigatórios

Nenhuma missão transversal é considerada pronta sem:

- validação de tipagem;
- revisão de persistência e migração;
- revisão de segurança e permissões;
- smoke manual dos fluxos impactados;
- alinhamento de versão, changelog e documentação;
- registro de riscos residuais.

## Contrato de feature

Toda feature nova precisa declarar:

- fonte de verdade;
- dados persistidos;
- compatibilidade retroativa;
- fallback;
- reversibilidade;
- risco de custo, latência ou dependência externa.

## Padrão para IA

Toda pipeline com IA deve explicitar:

- o que entra bruto do usuário;
- o que foi reorganizado;
- o que foi transcrito;
- o que foi inferido;
- o que foi acionado localmente;
- o que depende de provider externo.

## Padrão para sanitização

Nenhum artefato órfão, stub, mock ou lógica incompleta deve permanecer invisível. Se não for removido, deve ser:

- localizado;
- classificado;
- relacionado a risco;
- encaminhado para missão futura.

## Regra de preservação

Documentação anterior nunca deve ser destruída por substituição silenciosa. O correto é:

1. preservar;
2. indexar;
3. marcar contexto temporal;
4. ligar ao canon atual.
