#!/usr/bin/env node
// daisy-custom: copy components from the registry into your project.
//
//   npx daisy-custom@latest list
//   npx daisy-custom@latest add toast
//
// Components are fetched from GitHub at run time, so pushing to the registry
// repo makes them available immediately; the npm package only holds this CLI.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const { version } = createRequire(import.meta.url)('./package.json')

const DEFAULT_REPO = 'jpdevdotcom/daisy-custom'
const DEFAULT_REF = 'main'

const c = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code) => (s) => (c ? `\x1b[${code}m${s}\x1b[0m` : String(s))
const bold = paint(1)
const dim = paint(2)
const green = paint(32)
const yellow = paint(33)
const red = paint(31)
const cyan = paint(36)

const HELP = `${bold('daisy-custom')} ${dim(`v${version}`)}

${bold('Usage')}
  npx daisy-custom@latest <command> [options]

${bold('Commands')}
  list                  Show available components
  add <name...>         Copy components (and what they need) into your project

${bold('Options')}
  --path <dir>          Where components go (default: the registry's, usually src/components/ui)
  --examples            Also copy each component's demo files
  --overwrite           Replace files that already exist
  --no-install          Print the npm install command instead of running it
  --ref <ref>           Branch, tag or commit to install from (default: ${DEFAULT_REF})
  --registry <src>      owner/repo on GitHub, or a local folder (default: ${DEFAULT_REPO})
  --cwd <dir>           Project root (default: current directory)
  -v, --version         Print the CLI version
`

// --- args ------------------------------------------------------------------
const flags = {
  path: undefined,
  examples: false,
  overwrite: false,
  install: true,
  ref: DEFAULT_REF,
  registry: process.env.DAISY_CUSTOM_REGISTRY || DEFAULT_REPO,
  cwd: process.cwd(),
}
const positional = []
const argv = process.argv.slice(2)
const value = (i, name) => argv[i] ?? fail(`${name} needs a value`)
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--path') flags.path = value(++i, a)
  else if (a === '--ref') flags.ref = value(++i, a)
  else if (a === '--registry') flags.registry = value(++i, a)
  else if (a === '--cwd') flags.cwd = path.resolve(value(++i, a))
  else if (a === '--examples') flags.examples = true
  else if (a === '--overwrite') flags.overwrite = true
  else if (a === '--no-install') flags.install = false
  else if (a === '-v' || a === '--version') positional.unshift('version')
  else if (a === '-h' || a === '--help') positional.unshift('help')
  else if (a.startsWith('-')) fail(`Unknown option ${a}`)
  else positional.push(a)
}

function fail(msg) {
  console.error(`${red('✖')} ${msg}`)
  process.exit(1)
}

// --- registry source: GitHub (raw files) or a local checkout -----------------
const isLocal = /^[./~]/.test(flags.registry) || fs.existsSync(flags.registry)
const localRoot = isLocal ? path.resolve(flags.registry) : null
const rawBase = `https://raw.githubusercontent.com/${flags.registry}/${flags.ref}`

async function read(rel) {
  if (localRoot) {
    const p = path.join(localRoot, rel)
    if (!fs.existsSync(p)) fail(`Missing in registry: ${rel}`)
    return fs.readFileSync(p, 'utf8')
  }
  const url = `${rawBase}/${rel}`
  let res
  try {
    res = await fetch(url)
  } catch (e) {
    fail(`Could not reach GitHub (${e.cause?.code ?? e.message}). Are you online?`)
  }
  if (res.status === 404)
    fail(`Not found: ${url}\n  Check that the repo is public and --ref "${flags.ref}" exists.`)
  if (!res.ok) fail(`GitHub returned ${res.status} for ${url}`)
  return res.text()
}

const source = () => (localRoot ? localRoot : `${flags.registry}@${flags.ref}`)

// --- commands --------------------------------------------------------------
const [command, ...names] = positional

if (command === 'version') console.log(version)
else if (!command || command === 'help') console.log(HELP)
else if (command === 'list') await list()
else if (command === 'add') await add(names)
else fail(`Unknown command "${command}". Run with --help.`)

async function loadRegistry() {
  return JSON.parse(await read('registry.json'))
}

async function list() {
  const reg = await loadRegistry()
  const visible = Object.entries(reg.items).filter(([, i]) => !i.hidden)
  const width = Math.max(...visible.map(([n]) => n.length))
  console.log(`${bold(reg.name)} ${dim(`v${reg.version} · ${source()}`)}\n`)
  for (const [name, item] of visible)
    console.log(`  ${cyan(name.padEnd(width))}  ${item.description}`)
  console.log(
    `\n${dim('Install with:')} npx daisy-custom@latest add ${visible[0]?.[0] ?? '<name>'}`,
  )
}

function resolveItems(reg, requested) {
  const order = []
  const seen = new Set()
  const visit = (name) => {
    if (seen.has(name)) return
    const item = reg.items[name]
    if (!item) {
      const known = Object.keys(reg.items).filter((n) => !reg.items[n].hidden)
      fail(`No component named "${name}". Available: ${known.join(', ')}`)
    }
    seen.add(name)
    ;[...item.requires, ...(flags.examples ? item.exampleRequires : [])].forEach(visit)
    order.push(name)
  }
  requested.forEach(visit)
  return order
}

async function add(requested) {
  if (!requested.length)
    fail('Name at least one component, e.g. `add toast`. Run `list` to see them.')
  const pkgPath = path.join(flags.cwd, 'package.json')
  if (!fs.existsSync(pkgPath))
    fail(`No package.json in ${flags.cwd}. Run this from your project root.`)

  const reg = await loadRegistry()
  const outDir = path.resolve(flags.cwd, flags.path ?? reg.defaultPath)
  const items = resolveItems(reg, requested)
  const extra = items.filter((n) => !requested.includes(n))

  console.log(`${bold('daisy-custom')} ${dim(`· ${source()}`)}\n`)
  console.log(
    `Adding ${requested.map(cyan).join(', ')}` +
      (extra.length ? dim(` (+ required: ${extra.join(', ')})`) : ''),
  )
  console.log()

  // Download everything first so a network failure leaves the project untouched.
  const files = []
  const deps = {}
  const devDeps = {}
  for (const name of items) {
    const item = reg.items[name]
    for (const rel of [...item.files, ...(flags.examples ? item.examples : [])])
      files.push({ rel, content: await read(`${reg.dir}/${rel}`) })
    Object.assign(deps, item.dependencies)
    Object.assign(devDeps, item.devDependencies)
  }

  let written = 0
  let skipped = 0
  for (const { rel, content } of files) {
    const dest = path.join(outDir, rel)
    const shown = path.relative(flags.cwd, dest)
    if (fs.existsSync(dest) && !flags.overwrite) {
      console.log(`  ${yellow('~')} ${shown} ${dim('exists, skipped')}`)
      skipped++
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, content)
    console.log(`  ${green('+')} ${shown}`)
    written++
  }

  installMissing(pkgPath, deps, devDeps)

  console.log(
    `\n${green('✔')} Done. ${written} file${written === 1 ? '' : 's'} written` +
      (skipped ? `, ${skipped} skipped ${dim('(use --overwrite to replace)')}` : '') +
      '.',
  )
}

function installMissing(pkgPath, deps, devDeps) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const have = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }
  const missing = (d) =>
    Object.entries(d)
      .filter(([n]) => !have[n])
      .map(([n, v]) => `${n}@${v}`)
  const prod = missing(deps)
  const dev = missing(devDeps)
  if (!prod.length && !dev.length) return

  const pm = detectPackageManager()
  const verb = pm === 'npm' ? 'install' : 'add'
  const cmds = [
    prod.length && `${pm} ${verb} ${prod.join(' ')}`,
    dev.length && `${pm} ${verb} -D ${dev.join(' ')}`,
  ].filter(Boolean)

  console.log()
  if (!flags.install) {
    console.log(
      `${dim('Dependencies not installed. Run:')}\n${cmds.map((x) => `  ${x}`).join('\n')}`,
    )
    return
  }
  for (const cmd of cmds) {
    console.log(dim(`$ ${cmd}`))
    try {
      execSync(cmd, { cwd: flags.cwd, stdio: 'inherit' })
    } catch {
      fail(`"${cmd}" failed. The files were copied; run it yourself to finish.`)
    }
  }
}

function detectPackageManager() {
  let dir = flags.cwd
  // Walk up so monorepo packages find the workspace lockfile.
  while (true) {
    const has = (f) => fs.existsSync(path.join(dir, f))
    if (has('pnpm-lock.yaml')) return 'pnpm'
    if (has('yarn.lock')) return 'yarn'
    if (has('bun.lock') || has('bun.lockb')) return 'bun'
    if (has('package-lock.json')) return 'npm'
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  const ua = process.env.npm_config_user_agent ?? ''
  return ua.startsWith('pnpm')
    ? 'pnpm'
    : ua.startsWith('yarn')
      ? 'yarn'
      : ua.startsWith('bun')
        ? 'bun'
        : 'npm'
}
