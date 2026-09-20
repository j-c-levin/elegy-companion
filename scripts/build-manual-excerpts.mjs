import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REFERENCE = path.join(root, 'reference', 'elegy-4e-beta-v3.txt')
const REGISTRY = path.join(root, 'src', 'manual', 'refs.json')
const OUTPUT = path.join(root, 'src', 'manual', 'excerpts.json')
const ORACLE_DIR = path.join(root, 'src', 'data', 'oracles')
const CONTEXT = 4

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

writeFileSync(OUTPUT, JSON.stringify(excerpts) + '\n')
console.log(
  `build-manual-excerpts: ${Object.keys(excerpts).length} excerpts ` +
    `(${Object.values(excerpts).reduce((sum, e) => sum + e.lines.length, 0)} lines) -> ${path.relative(root, OUTPUT)}`,
)
