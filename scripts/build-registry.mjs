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

// Paths below are POSIX-style and relative to the registry root, e.g.
// "daisy-table/Table.vue". That relative shape is preserved in the consumer's
// project, which is what keeps the components' relative imports valid.
const rel = (item, file) => (item.dir ? `${item.dir}/${file}` : file)
const filesOf = (item) => [...(item.files ?? []), ...(item.examples ?? [])]

const owner = new Map()
for (const [name, item] of Object.entries(config.items))
  for (const f of filesOf(item)) owner.set(rel(item, f), name)

const CANDIDATES = ['', '.ts', '.vue', '.js']
const resolveLocal = (from, spec) => {
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec))
  return CANDIDATES.map((e) => target + e).find((c) => owner.has(c)) ?? null
}

const warnings = []
function scan(relPath) {
  const code = fs.readFileSync(path.join(srcDir, relPath), 'utf8')
  const local = new Set()
  const bare = new Set()
  for (const [, spec] of code.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (spec.startsWith('.')) {
      const hit = resolveLocal(relPath, spec)
      if (hit) local.add(hit)
      else warnings.push(`unresolved local import "${spec}" in ${relPath}`)
    } else {
      bare.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])
    }
  }
  return { local, bare }
}

const collect = (item, files, name) => {
  const requires = new Set()
  const deps = {}
  for (const f of files) {
    const relPath = rel(item, f)
    if (!fs.existsSync(path.join(srcDir, relPath)))
      throw new Error(`missing file: ${config.dir}/${relPath}`)
    const { local, bare } = scan(relPath)
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
  const main = collect(item, item.files ?? [], name)
  const ex = collect(item, item.examples ?? [], name)
  items[name] = {
    description: item.description ?? '',
    hidden: item.hidden ?? false,
    files: (item.files ?? []).map((f) => rel(item, f)),
    examples: (item.examples ?? []).map((f) => rel(item, f)),
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
  console.log(`   ${n.padEnd(14)} ${i.files[0] ?? ''}  requires:[${i.requires}] deps:${Object.keys(i.dependencies)}`)
