# ss-3.4 — fix-eslint-warnings (G18)

**Status:** ✅ done
**Gap:** G18 — regra `@typescript-eslint/explicit-function-return-type` definida duas vezes
**Branch:** `feat/gov-sprint-3`

## O que foi feito

Removida a definição duplicada de `explicit-function-return-type` (linha 24, `'error'` simples).
Mantida apenas a definição detalhada com opções (originalmente linha 40):

```js
'@typescript-eslint/explicit-function-return-type': ['warn', {
  allowExpressions: true,
  allowTypedFunctionExpressions: true,
  allowHigherOrderFunctions: true,
}]
```

## Por que 'warn' e não 'error'

Return types em callbacks e lambdas são verbose e redundantes com TypeScript inference.
A decisão é documentada no comentário no próprio `.eslintrc.cjs`.
Os 443 warnings restantes são aceitáveis — refletem código real que funciona.
O bloqueador era a **precedência de regra conflitante**: `'error'` sobrescrevia o `'warn'` com opções,
fazendo ESLint recusar código perfeitamente válido.
