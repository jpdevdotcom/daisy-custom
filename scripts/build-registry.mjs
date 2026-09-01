#!/usr/bin/env node
// Generates registry.json by scanning component imports.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const config = (await import(pathToFileURL(path.join(root, 'registry.config.mjs')))).default
const srcDir = path.join(root, config.dir)
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const installed = { ...pkg.dependencies, ...pkg.devDependencies }

// filename -> owning item
const owner = new Map()
for (const [name, item] of Object.entries(config.items))
  for (const f of [...(item.files ?? []), ...(item.examples ?? [])]) owner.set(f, name)

const CANDIDATES = ['', '.ts', '.vue', '.js']
const resolveLocal = (spec) => {
  const base = spec.replace(/^\.\//, '')
  return CANDIDATES.map((e) => base + e).find((c) => owner.has(c)) ?? null
}

const warnings = []
function scan(file) {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf8')
  const local = new Set()
  const bare = new Set()
  for (const [, spec] of code.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (spec.startsWith('.')) {
      const hit = resolveLocal(spec)
      if (hit) local.add(hit)
      else warnings.push(`unresolved local import "${spec}" in ${file}`)
    } else {
      bare.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])
    }
  }
  return { local, bare }
}

const collect = (files, name) => {
  const requires = new Set()
  const deps = {}
  for (const f of files) {
    if (!fs.existsSync(path.join(srcDir, f))) throw new Error(`missing file: ${config.dir}/${f}`)
    const { local, bare } = scan(f)
    for (const l of local) {
      const o = owner.get(l)
      if (o && o !== name) requires.add(o)
    }
    for (const b of bare) deps[b] = installed[b] ?? '*'
  }
  return { requires: [...requires], deps }
}

const items = {}
for (const [name, item] of Object.entries(config.items)) {
  const main = collect(item.files ?? [], name)
  const ex = collect(item.examples ?? [], name)
  items[name] = {
    description: item.description ?? '',
    hidden: item.hidden ?? false,
    files: item.files ?? [],
    examples: item.examples ?? [],
    requires: main.requires,
    exampleRequires: ex.requires.filter((r) => !main.requires.includes(r)),
    dependencies: { ...main.deps, ...(item.dependencies ?? {}) },
    devDependencies: { ...(item.devDependencies ?? {}) },
  }
}

fs.writeFileSync(
  path.join(root, 'registry.json'),
  JSON.stringify({ ...config, items }, null, 2) + '\n',
)

for (const w of warnings) console.warn(`  ! ${w}`)
console.log(`✓ registry.json — ${Object.keys(items).length} items`)
for (const [n, i] of Object.entries(items))
  console.log(
    `   ${n.padEnd(14)} files:${i.files.length} requires:[${i.requires}] deps:${Object.keys(i.dependencies)}`,
  )
