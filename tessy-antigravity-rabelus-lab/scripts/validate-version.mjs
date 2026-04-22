#!/usr/bin/env node
/**
 * validate-version.mjs — Tessy Rabelus Lab
 * Valida que todas as 4 fontes de versão estão sincronizadas (Gate G5)
 *
 * Uso:
 *   node scripts/validate-version.mjs
 *   npm run validate-version
 *
 * Códigos de saída:
 *   0 — todas as fontes sincronizadas
 *   1 — divergência detectada
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let hasError = false;

function fail(msg) {
  console.error(`❌ ${msg}`);
  hasError = true;
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

// --- 1. Leitura do package.json ---
const pkgPath = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const pkgVersion = pkg.version;

console.log(`\n🔍 Validando consistência de versão (Gate G5)`);
console.log(`   Referência (package.json): v${pkgVersion}\n`);

// --- 2. Verificar VERSION.md ---
const versionPath = resolve(ROOT, 'VERSION.md');
const versionMd = readFileSync(versionPath, 'utf8');
const versionMatch = versionMd.match(/\*\*Version:\*\* ([\d.]+)/);
if (!versionMatch) {
  fail('VERSION.md: linha **Version:** não encontrada');
} else {
  const v = versionMatch[1];
  if (v === pkgVersion) {
    ok(`VERSION.md: v${v}`);
  } else {
    fail(`VERSION.md: v${v} ≠ package.json v${pkgVersion}`);
  }
}

// --- 3. Verificar rodapé do App.tsx ---
const appPath = resolve(ROOT, 'App.tsx');
const appContent = readFileSync(appPath, 'utf8');
const appMatch = appContent.match(/Tesseract v([\d.]+)/);
if (!appMatch) {
  fail('App.tsx: "Tesseract vX.X.X" não encontrado no rodapé');
} else {
  const v = appMatch[1];
  if (v === pkgVersion) {
    ok(`App.tsx rodapé: v${v}`);
  } else {
    fail(`App.tsx rodapé: v${v} ≠ package.json v${pkgVersion}`);
  }
}

// --- 4. Verificar CHANGELOG.md (release mais recente) ---
const changelogPath = resolve(ROOT, 'CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf8');
// Encontra o primeiro cabeçalho versionado (ignora [Unreleased])
const changelogMatch = changelog.match(/## \[v([\d.]+)[^\]]*\]/);
if (!changelogMatch) {
  fail('CHANGELOG.md: nenhum cabeçalho de release encontrado no formato ## [vX.Y.Z...]');
} else {
  const v = changelogMatch[1];
  if (v === pkgVersion) {
    ok(`CHANGELOG.md: v${v}`);
  } else {
    fail(`CHANGELOG.md release mais recente: v${v} ≠ package.json v${pkgVersion}`);
  }
}

// --- Resumo ---
console.log('');
if (hasError) {
  console.error(
    '💥 Divergência de versão detectada. Execute: node scripts/release.mjs <patch|minor|major> <codinome>'
  );
  process.exit(1);
} else {
  console.log(`🎯 Todas as fontes sincronizadas em v${pkgVersion} — Gate G5 APROVADO`);
  process.exit(0);
}
