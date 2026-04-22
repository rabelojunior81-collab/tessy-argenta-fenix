// ─────────────────────────────────────────────────────────────
// Inception Methodology · Filesystem Utilities
// by Rabelus Lab
// ─────────────────────────────────────────────────────────────

import fs from 'node:fs'
import path from 'node:path'

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true })
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf-8')
}

export function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

export function listDir(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath)
  } catch {
    return []
  }
}

export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export function moveDir(src: string, dest: string): void {
  ensureDir(path.dirname(dest))
  fs.renameSync(src, dest)
}

export function copyDir(src: string, dest: string): void {
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

export function resolveCwd(...parts: string[]): string {
  return path.resolve(process.cwd(), ...parts)
}
