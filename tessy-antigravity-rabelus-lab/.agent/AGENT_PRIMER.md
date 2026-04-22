# AGENT PRIMER — Tessy / Rabelus Lab
> **Leia este arquivo PRIMEIRO antes de qualquer ação neste repositório.**
> Válido para: Claude, Gemini, Kimi, OpenCode, Grok, ou qualquer agente.

---

## O QUE É ESTE PROJETO

**Tessy** é um Córtex Externo — uma plataforma de Hiper-Engenharia Assistida por IA desenvolvida no **Rabelus Lab** por Adilson (proprietário).

**Stack:** React 19 + TypeScript + Vite | Gemini 3/3.1 | Dexie (IndexedDB) | isomorphic-git | xterm.js | Biome

**Repositório:** `tessy-antigravity-rabelus-lab`
**Proprietário:** Adilson (GitHub: rabelojunior81-collab)

---

## SEPARAÇÃO PRODUTO / DESENVOLVIMENTO

| Camada | Localização | Descrição |
|--------|-------------|-----------|
| **Produto** | `src/`, `components/`, `services/`, `contexts/`, `hooks/`, `App.tsx`, `index.html`, `index.tsx`, `types.ts` | O que Tessy É — código de produto React |
| **Desenvolvimento** | `.agent/`, `docs/`, `scripts/`, `CHANGELOG.md`, `VERSION.md` | Como Tessy É FEITA — governança, missões, docs, automação |

**Regra:** nunca misture produto com desenvolvimento. Mudanças em produto requerem missão TMP completa.

---

## AS LEIS (PROTOCOLOS OBRIGATÓRIOS)

Todos os protocolos estão em `.agent/protocols/`:

| Arquivo | Nome | Descrição |
|---------|------|-----------|
| [`TDP.md`](.agent/protocols/TDP.md) | Tessy Dev Protocol | 8 princípios + 6 gates obrigatórios |
| [`TMP.md`](.agent/protocols/TMP.md) | Tessy Mission Protocol | Barramento de missões, roles, ciclo de vida |
| [`TSP.md`](.agent/protocols/TSP.md) | Tessy Safety Protocol | Branches, commits atômicos, segurança |
| [`VERSIONING.md`](.agent/protocols/VERSIONING.md) | Política de Versionamento | Quando bumpar patch/minor/major, como usar release.mjs |
| [`CANON.md`](.agent/protocols/CANON.md) | Rabelus Lab Canon | Governança geral do laboratório |

---

## REGRAS NÃO-NEGOCIÁVEIS

1. **NUNCA** modificar código de produto sem missão TMP ativa e branch feature/
2. **NUNCA** usar `biome --unsafe` em componentes React (quebra TypeScript)
3. **NUNCA** fazer merge sem aprovação explícita de Adilson
4. **NUNCA** deletar arquivos — apenas arquivar/mover (journal ou subpasta)
5. **NUNCA** modificar arquivos em `.agent/missions/journal/` (imutáveis)
6. **NUNCA** pular gates obrigatórios (G1 tsc, G4 npm run dev, G5 validate-version)
7. **SEMPRE** criar missão TMP + branch + commits atômicos antes de codar
8. **SEMPRE** executar `npm run validate-version` antes de qualquer release

---

## REGRA DE OURO — LÍNGUA (pt-BR OBRIGATÓRIO)

> **TODA documentação, comentários de código, strings de saída de scripts, mensagens de erro/sucesso e arquivos de governança deste repositório DEVEM estar em Português do Brasil (pt-BR), sem exceção.**

**Permitido em inglês (apenas):**
- Identificadores de código: variáveis, funções, classes, tipos TypeScript
- Strings de API e campos JSON que interagem com sistemas externos
- Termos técnicos sem tradução consolidada: `commit`, `branch`, `merge`, `lint`, `hook`, `codename`, `patch`, `minor`, `major`
- Código de produto React/TypeScript existente (não alterar código de produto só para traduzir)

**Proibido em inglês:**
- Comentários `//` e `/* */` em scripts e arquivos de configuração
- JSDoc / docstrings
- Strings de `console.log`, `console.error`, mensagens de saída de scripts
- Seções, títulos, parágrafos de arquivos `.md`
- Arquivos de protocolo em `.agent/protocols/`
- Mensagens de commit (usar pt-BR, exceto termos técnicos acima)

**Violação desta regra = missão de correção obrigatória antes de avançar.**

---

## VERSIONAMENTO

Versão atual: veja `package.json` → campo `"version"`.

Para bumpar versão use **sempre** o script automatizado:
```bash
node scripts/release.mjs patch <codename>    # bug fix / lint / sanitização
node scripts/release.mjs minor <codename>   # feature nova / integração completa
node scripts/release.mjs major <codename>   # quebra arquitetural / reescrita
```

Para validar consistência entre as 4 fontes (package.json, VERSION.md, App.tsx, CHANGELOG):
```bash
npm run validate-version
```

---

## ESTRUTURA DO REPOSITÓRIO

```
tessy-antigravity-rabelus-lab/
├── AGENT_PRIMER.md          ← VOCÊ ESTÁ AQUI
├── CHANGELOG.md             ← histórico de versões
├── VERSION.md               ← versão atual + codename
├── package.json
├── src/                     ← PRODUTO (não tocar sem missão)
│   ├── App.tsx
│   ├── components/
│   ├── services/
│   ├── contexts/
│   ├── hooks/
│   └── types.ts
├── scripts/
│   ├── release.mjs          ← automatiza bump de versão (G5)
│   └── validate-version.mjs ← valida sincronia das 4 fontes
├── .agent/
│   ├── AGENT_PRIMER.md      ← espelho deste arquivo
│   ├── protocols/           ← AS LEIS (TDP, TMP, TSP, VERSIONING, CANON)
│   ├── governance/          ← status de governança
│   ├── missions/
│   │   ├── active/          ← missões em andamento
│   │   ├── journal/         ← missões concluídas (IMUTÁVEL)
│   │   └── _template/       ← template para novas missões
│   └── skills/              ← habilidades reutilizáveis
└── docs/
    ├── architecture/        ← ARCHITECTURE.md + assets
    ├── audits/              ← auditorias por agente/data
    ├── incidents/           ← incidentes pós-missão
    ├── methodology/         ← metodologia Rabelus Lab
    ├── experiments/         ← experimentos e protótipos
    └── legacy-data/         ← dados históricos
```

---

## COMO INICIAR UMA MISSÃO

1. Leia TDP, TMP e TSP completos em `.agent/protocols/`
2. Crie a missão em `.agent/missions/active/<nome-missão>/` (use `_template/`)
3. Crie branch: `git checkout -b feature/<nome-missão>`
4. Commits atômicos por grupo de trabalho
5. Gates obrigatórios antes do PR
6. PR → aprovação de Adilson → merge
7. Archive missão em `.agent/missions/journal/`

---

*Este arquivo é mantido pelos protocolos TDP/TMP. Última atualização: 2026-03-18.*
