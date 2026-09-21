import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { reflowRange } from './lib/manual-reflow.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REFERENCE = path.join(root, 'reference', 'elegy-4e-beta-v3.txt')
const REGISTRY = path.join(root, 'src', 'manual', 'refs.json')
const OUTPUT = path.join(root, 'src', 'manual', 'excerpts.json')
const READABLE_OUTPUT = path.join(root, 'src', 'manual', 'readable.json')
const OVERRIDES = path.join(root, 'src', 'manual', 'readable-overrides.json')
const ORACLE_DIR = path.join(root, 'src', 'data', 'oracles')
const GLOSSARY = path.join(root, 'src', 'data', 'glossary.json')
const ASPECTS = path.join(root, 'src', 'data', 'aspects.json')
const CONTEXT = 4
const READABLE_MAX_LINES = 110

const lines = readFileSync(REFERENCE, 'utf8').split('\n')

function fail(message) {
  console.error(`build-manual-excerpts: ${message}`)
  process.exit(1)
}

function rangeKey(start, end) {
  return `${start}-${end}`
}

const requested = new Map()

function requestRange(start, end, origin) {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    fail(`${origin}: non-integer range ${start}-${end}`)
  }
  if (start < 1 || end < start || end > lines.length) {
    fail(`${origin}: range ${start}-${end} outside 1-${lines.length}`)
  }
  const key = rangeKey(start, end)
  if (!requested.has(key)) requested.set(key, [])
  requested.get(key).push(origin)
}

const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'))
for (const entry of registry) {
  if (!entry.key || !entry.label || !Array.isArray(entry.ranges) || entry.ranges.length === 0) {
    fail(`registry entry ${entry.key ?? '(no key)'} needs key, label and a non-empty ranges array`)
  }
  for (const range of entry.ranges) {
    requestRange(range.start, range.end, `refs.json:${entry.key}`)
  }
}

const oracleFiles = readdirSync(ORACLE_DIR).filter((f) => f.endsWith('.json'))
for (const file of oracleFiles) {
  const table = JSON.parse(readFileSync(path.join(ORACLE_DIR, file), 'utf8'))
  const match = /:(\d+)-(\d+)$/.exec(table.source ?? '')
  if (!match) continue
  requestRange(Number(match[1]), Number(match[2]), `oracles/${file}`)
}

const registryKeys = new Set(registry.map((entry) => entry.key))
for (const track of ['health', 'clarity', 'blood', 'conscience', 'standing']) {
  if (!registryKeys.has(`end-${track}`)) fail(`registry is missing the "end-${track}" key used by endRefKey()`)
}
for (const meter of ['health', 'clarity', 'blood']) {
  if (!registryKeys.has(`mitigate-${meter}`)) fail(`registry is missing the "mitigate-${meter}" key used by mitigationRefKey()`)
}

const conditionsSource = readFileSync(
  path.join(root, 'src', 'features', 'character', 'conditions.ts'),
  'utf8',
)
for (const match of conditionsSource.matchAll(/key: '([A-Za-z ]+)'/g)) {
  const refKey = `cond-${match[1].toLowerCase().replace(/\s+/g, '-')}`
  if (!registryKeys.has(refKey)) fail(`registry is missing "${refKey}" for condition "${match[1]}"`)
}

const glossary = JSON.parse(readFileSync(GLOSSARY, 'utf8'))
for (const term of glossary.terms ?? []) {
  const match = /^(\d+)-(\d+)$/.exec(term.ref ?? '')
  if (!match) fail(`glossary term "${term.term}" has unparseable ref "${term.ref}"`)
  requestRange(Number(match[1]), Number(match[2]), `glossary:${term.term}`)
}

const aspects = JSON.parse(readFileSync(ASPECTS, 'utf8'))
for (const type of aspects.types ?? []) {
  const match = /^(\d+)-(\d+)$/.exec(type.ref ?? '')
  if (!match) fail(`aspects type "${type.aspectType}" has unparseable ref "${type.ref}"`)
  requestRange(Number(match[1]), Number(match[2]), `aspects:${type.aspectType}`)
}

const excerpts = {}
for (const key of [...requested.keys()].sort((a, b) => {
  const [as] = a.split('-').map(Number)
  const [bs] = b.split('-').map(Number)
  return as - bs
})) {
  const [start, end] = key.split('-').map(Number)
  const from = Math.max(1, start - CONTEXT)
  const to = Math.min(lines.length, end + CONTEXT)
  excerpts[key] = {
    start,
    end,
    lines: Array.from({ length: to - from + 1 }, (_, i) => ({
      n: from + i,
      text: lines[from + i - 1].replace(/\s+$/, ''),
    })),
  }
}

let splices = []
try {
  const overrides = JSON.parse(readFileSync(OVERRIDES, 'utf8'))
  if (!Array.isArray(overrides.splices)) fail('readable-overrides.json needs a "splices" array')
  splices = overrides.splices
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const readable = {}
const skipped = []
for (const key of Object.keys(excerpts)) {
  const [start, end] = key.split('-').map(Number)
  if (end - start + 1 > READABLE_MAX_LINES) {
    skipped.push(key)
    continue
  }
  const { blocks, uncovered } = reflowRange(start, end, lines, splices)
  if (uncovered.length > 0) {
    fail(`readable reflow for ${key} leaves lines uncovered: ${uncovered.join(',')}`)
  }
  readable[key] = { start, end, blocks }
}

writeFileSync(OUTPUT, JSON.stringify(excerpts) + '\n')
writeFileSync(READABLE_OUTPUT, JSON.stringify(readable) + '\n')
console.log(
  `build-manual-excerpts: ${Object.keys(excerpts).length} excerpts ` +
    `(${Object.values(excerpts).reduce((sum, e) => sum + e.lines.length, 0)} lines) -> ${path.relative(root, OUTPUT)}`,
)
console.log(
  `build-manual-excerpts: ${Object.keys(readable).length} readable ` +
    `(${skipped.length} ranges over the ${READABLE_MAX_LINES}-line cap) -> ${path.relative(root, READABLE_OUTPUT)}`,
)
