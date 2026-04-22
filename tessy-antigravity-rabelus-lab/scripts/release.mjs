#!/usr/bin/env node

/**
 * release.mjs — Tessy Rabelus Lab
 * Automatiza o bump de versão em todas as 4 fontes simultaneamente (Gate G5)
 *
 * Uso:
 *   node scripts/release.mjs patch <codinome>
 *   node scripts/release.mjs minor <codinome>
 *   node scripts/release.mjs major <codinome>
 *
 * Exemplo:
 *   node scripts/release.mjs patch toolcalling-lint-pass
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// --- Argumentos ---
const [, , bumpType, codename] = process.argv;

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('❌ Tipo de bump inválido. Use: patch | minor | major');
  process.exit(1);
}
if (!codename) {
  console.error('❌ Codinome ausente. Exemplo: node scripts/release.mjs patch minha-feature');
  process.exit(1);
}

// --- Leitura da versão atual ---
const pkgPath = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const current = pkg.version;
const parts = current.split('.').map(Number);

// --- Cálculo da nova versão ---
let [major, minor, patch] = parts;
if (bumpType === 'major') {
  major++;
  minor = 0;
  patch = 0;
} else if (bumpType === 'minor') {
  minor++;
  patch = 0;
} else {
  patch++;
}
const next = `${major}.${minor}.${patch}`;
const nextFull = `${next}-${codename}`;
const today = new Date().toISOString().split('T')[0];

console.log(`\n🚀 Bump ${current} → ${next} (${nextFull})`);
console.log(`   Codinome: ${codename}`);
console.log(`   Data: ${today}\n`);

// --- 1. Atualizar package.json ---
pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('✅ package.json atualizado');

// --- 2. Atualizar VERSION.md ---
const versionPath = resolve(ROOT, 'VERSION.md');
let versionMd = readFileSync(versionPath, 'utf8');
// Atualiza as linhas de número de versão
versionMd = versionMd.replace(/\*\*Version:\*\* .+/, `**Version:** ${next}`);
versionMd = versionMd.replace(/\*\*Codename:\*\* .+/, `**Codename:** ${codename}`);
versionMd = versionMd.replace(/\*\*Release Date:\*\* .+/, `**Release Date:** ${today}`);
versionMd = versionMd.replace(/- \*\*Semantic Version:\*\* .+/, `- **Semantic Version:** ${next}`);
versionMd = versionMd.replace(
  /- \*\*Previous Version:\*\* .+/,
  `- **Previous Version:** ${current}`
);
writeFileSync(versionPath, versionMd);
console.log('✅ VERSION.md atualizado');

// --- 3. Atualizar rodapé do App.tsx ---
const appPath = resolve(ROOT, 'App.tsx');
let appContent = readFileSync(appPath, 'utf8');
// Padrão: Tesseract vX.X.X (QualquerCodinome)
const appVersionRegex = /Tesseract v[\d.]+ \([^)]+\)/;
const codenameDisplay = codename
  .split('-')
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');
const newBanner = `Tesseract v${next} (${codenameDisplay})`;
if (!appVersionRegex.test(appContent)) {
  console.warn('⚠️  Banner de versão não encontrado em App.tsx — atualização do App.tsx ignorada');
} else {
  appContent = appContent.replace(appVersionRegex, newBanner);
  writeFileSync(appPath, appContent);
  console.log(`✅ Rodapé do App.tsx atualizado → "${newBanner}"`);
}

// --- 4. Atualizar CHANGELOG.md ---
const changelogPath = resolve(ROOT, 'CHANGELOG.md');
let changelog = readFileSync(changelogPath, 'utf8');
const unreleasedRegex = /^## \[Unreleased\]/m;
if (!unreleasedRegex.test(changelog)) {
  console.warn('⚠️  Seção [Unreleased] não encontrada no CHANGELOG.md — ignorando');
} else {
  const newRelease = `## [v${nextFull}] - ${today}`;
  changelog = changelog.replace(unreleasedRegex, newRelease);
  // Adiciona uma nova seção [Unreleased] no topo para entradas futuras
  changelog = changelog.replace(newRelease, `## [Unreleased]\n\n---\n\n${newRelease}`);
  writeFileSync(changelogPath, changelog);
  console.log(`✅ CHANGELOG.md atualizado → [v${nextFull}]`);
}

// --- 5. Commit atômico ---
console.log('\n📦 Criando commit atômico...');
execSync(`git add package.json VERSION.md App.tsx CHANGELOG.md`, { cwd: ROOT, stdio: 'inherit' });
execSync(`git commit -m "TSP: [RELEASE] bump v${nextFull}"`, { cwd: ROOT, stdio: 'inherit' });
console.log('✅ Commit criado');

// --- 6. Tag git ---
execSync(`git tag v${next}`, { cwd: ROOT, stdio: 'inherit' });
console.log(`✅ Tag v${next} criada`);

console.log(`\n🎉 Release v${nextFull} concluída!`);
console.log(`   Execute: npm run validate-version   para confirmar que todas as fontes estão sincronizadas`);
