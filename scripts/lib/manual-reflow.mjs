// Reflow of the pdftotext -layout extraction into readable blocks.
// REFLOW ONLY: text is preserved verbatim; only layout artifacts are fixed.

const GUTTER_MIN_START = 5
const GUTTER_MAX_START = 58
const GUTTER_MIN_RESUME = 56

export function isBoilerplate(text) {
  if (/4 e B e ta M a n u a l/.test(text)) return true
  if (/^E LE GY\b/.test(text.trim())) return true
  if (/^\d{1,3}$/.test(text.trim())) return true
  return false
}

function isRollPrefixed(raw) {
  return /^\s*\d{1,3}([–-]\d{1,3})?(?!\d)( {2,}|$)/.test(raw)
}

function isDiceHeader(raw) {
  return /^\s*\d*d\d+\s*($|\S)/i.test(raw) && /^\s*\d*d\d+/.test(raw)
}

function candidateResumes(raw) {
  const out = []
  for (const gap of raw.matchAll(/ {3,}/g)) {
    if (gap.index < 5 || gap.index > GUTTER_MAX_START) continue
    if (raw.slice(0, gap.index).trim().length < 30) continue
    const resume = gap.index + gap[0].length
    if (resume < 40 || resume > 72) continue
    if (!raw.slice(resume).trim()) continue
    out.push(resume)
  }
  return out
}

function pageEdges(rows) {
  const resumes = []
  for (const { raw } of rows) {
    if (!raw.trim()) continue
    resumes.push(...candidateResumes(raw))
  }
  const clusters = []
  for (const r of [...resumes].sort((a, b) => a - b)) {
    const last = clusters[clusters.length - 1]
    if (last && r - last.hi <= 3) {
      last.hi = Math.max(last.hi, r)
      last.count++
    } else {
      clusters.push({ lo: r, hi: r, count: 1 })
    }
  }
  return clusters.filter((c) => c.count >= 2 && c.lo >= 50).map((c) => Math.round((c.lo + c.hi) / 2))
}

function splitAtEdge(raw, edges) {
  for (const gap of raw.matchAll(/ {3,}/g)) {
    if (gap.index < 5 || gap.index > GUTTER_MAX_START) continue
    const resume = gap.index + gap[0].length
    if (!edges.some((e) => resume >= e - 2 && resume <= e + 3)) continue
    if (!raw.slice(resume).trim()) continue
    return {
      left: { text: raw.slice(0, gap.index).replace(/\s+$/, ''), indent: raw.length - raw.trimStart().length },
      right: { text: raw.slice(resume), indent: resume },
    }
  }
  return null
}

function normalClassify(raw, edges) {
  const lead = raw.length - raw.trimStart().length
  if (lead >= GUTTER_MIN_RESUME) {
    return { kind: 'twocol', left: null, right: { text: raw, indent: lead } }
  }
  if (isRollPrefixed(raw) || isDiceHeader(raw)) return { kind: 'full', text: raw }
  const split = splitAtEdge(raw, edges)
  if (split) return { kind: 'twocol', ...split }
  const end = raw.replace(/\s+$/, '').length
  if (lead <= 16 && end <= 55) {
    return { kind: 'twocol', left: { text: raw, indent: lead }, right: null }
  }
  return { kind: 'full', text: raw }
}

function classifyRow(raw, n, sideSplices, singleColumn, fresh, edges, forcedFull) {
  if (!raw.trim()) return { kind: 'blank' }
  if (forcedFull) return { kind: 'full', text: raw, fresh }
  const lead = raw.length - raw.trimStart().length
  for (const sp of sideSplices) {
    if (n >= sp.from && n <= sp.to) {
      const normal = normalClassify(raw, edges)
      if (normal.kind === 'twocol') return normal
      if (sp.side === 'right') {
        return { kind: 'twocol', left: null, right: { text: raw, indent: lead, fresh } }
      }
      return { kind: 'twocol', left: { text: raw, indent: lead, fresh }, right: null }
    }
  }
  if (singleColumn) return { kind: 'full', text: raw, fresh }
  const normal = normalClassify(raw, edges)
  if (normal.left) normal.left.fresh = fresh
  if (normal.right) normal.right.fresh = fresh
  if (normal.text !== undefined) normal.fresh = fresh
  return normal
}

function buildSegments(rows, splices, singleColumn) {
  const fullSplices = splices.filter((sp) => sp.side === 'full')
  const sideSplices = splices.filter((sp) => sp.side !== 'full')
  const segments = []
  let current = null
  let pageRows = []
  const consumeFullSplice = (n) => {
    for (const sp of fullSplices) {
      if (n >= sp.from && n <= sp.to) {
        const last = segments[segments.length - 1]
        if (!last || last.type !== 'spliced' || last.from !== sp.from) {
          segments.push({ type: 'spliced', from: sp.from, blocks: sp.blocks })
        }
        return true
      }
    }
    return false
  }
  function flushPage() {
    const edges = pageEdges(pageRows)
    const hasLead = pageRows.some(({ raw }) => raw.length - raw.trimStart().length >= GUTTER_MIN_RESUME)
    const hasGaps = pageRows.some(({ raw }) => / {3,}/.test(raw))
    const pageSingle = singleColumn || (edges.length === 0 && !hasLead && hasGaps)
    const forcedFull = new Set()
    for (let i = 0; i < pageRows.length; i++) {
      if (!pageRows[i].raw.trim()) continue
      let j = i
      while (j + 1 < pageRows.length && pageRows[j + 1].raw.trim()) j++
      const group = pageRows.slice(i, j + 1)
      const cellCounts = group.map((r) => splitRowCells(r.raw).length)
      const rollRows = group.filter((r) => isRollPrefixed(r.raw)).length
      const multiRows = cellCounts.filter((c) => c >= 3).length
      const twoCellStarts = group
        .map((r) => (splitRowCells(r.raw).length === 2 ? splitRowCells(r.raw)[1].start : Infinity))
      const lowSecond = twoCellStarts.filter((s) => s < 50).length
      const isTable =
        (multiRows >= 2 && (cellCounts[0] >= 3 || multiRows >= 3)) ||
        (group.length >= 3 && lowSecond >= 2 && cellCounts.filter((c) => c >= 2).length >= 2) ||
        (rollRows >= 1 && group.length >= 3)
      const diceHeader = group.length === 1 && isDiceHeader(group[0].raw)
      if (isTable || diceHeader) for (const r of group) forcedFull.add(r.n)
      i = j
    }
    for (const row of pageRows) {
      if (consumeFullSplice(row.n)) continue
      const cls = classifyRow(row.raw, row.n, sideSplices, pageSingle, row.fresh, edges, forcedFull.has(row.n))
      if (cls.kind === 'blank') {
        if (current) {
          if (current.type === 'twocol') {
            current.left.push({ n: row.n, text: '', indent: 0, fresh: row.fresh })
            current.right.push({ n: row.n, text: '', indent: 0, fresh: row.fresh })
          } else {
            current.rows.push({ n: row.n, text: '', fresh: row.fresh })
          }
        }
        continue
      }
      const isTwocol = cls.kind === 'twocol'
      if (!current || current.type !== (isTwocol ? 'twocol' : 'full')) {
        current = { type: isTwocol ? 'twocol' : 'full', left: [], right: [], rows: [] }
        segments.push(current)
      }
      if (isTwocol) {
        if (cls.left) current.left.push({ n: row.n, text: cls.left.text, indent: cls.left.indent, fresh: cls.left.fresh })
        if (cls.right) current.right.push({ n: row.n, text: cls.right.text, indent: cls.right.indent, fresh: cls.right.fresh })
      } else {
        current.rows.push({ n: row.n, text: row.raw, fresh: cls.fresh })
      }
    }
    current = null
    pageRows = []
  }
  for (const row of rows) {
    if (row.fresh && pageRows.length) flushPage()
    pageRows.push(row)
  }
  flushPage()
  return segments
}

function isAllCapsHeading(text) {
  const t = text.trim()
  if (t.length < 1 || t.length > 48) return false
  if (!/[A-Z]/.test(t)) return false
  if (/[a-z]/.test(t)) return false
  return true
}

function isLabelPara(text) {
  return /^[A-Z][A-Za-z0-9 '’\-/()]{1,40}: /.test(text.trim())
}

function joinFragments(parts) {
  let out = ''
  for (const part of parts) {
    const text = part.text.trim()
    if (!text) continue
    if (!out) {
      out = text
      continue
    }
    if (/-$/.test(out) && !/[–—]$/.test(out) && /^[a-z]/.test(text)) {
      out = out.slice(0, -1) + text
    } else if (/-$/.test(out) && !/[–—]$/.test(out)) {
      out = out + text
    } else {
      out = out + ' ' + text
    }
  }
  return out.replace(/ {2,}/g, ' ')
}

function looksLikeHeadingPara(text, lineCount) {
  if (lineCount !== 1) return false
  if (isLabelPara(text)) return false
  const t = text.trim()
  if (t.length < 1 || t.length > 60) return false
  if (/[.,;!?]$/.test(t) && !/\)$/.test(t) && !/…$/.test(t)) return false
  if (!/^[A-Z0-9"“'(]/.test(t)) return false
  if (t.split(/\s+/).length > 8) return false
  return true
}

function isHeadingShape(text) {
  const t = text.trim()
  if (t.length < 1 || t.length > 45) return false
  if (!/^[A-Z0-9"“'(]/.test(t)) return false
  if (/[.]$/.test(t)) return false
  return true
}

function firstPartHeading(text) {
  const t = text.trim()
  if (t.length < 2 || t.length > 45) return false
  if (/[.,;!?]$/.test(t)) return false
  if (!/^[A-Z0-9]/.test(t)) return false
  if (t.split(/\s+/).length > 6) return false
  return true
}

function isTableToken(text) {
  return isRollPrefixed(text) || isDiceHeader(text)
}

function parseTableRun(tokens) {
  const lines = tokens.map((t) => ({ n: t.n, text: t.text }))
  const groups = []
  let pendingBlank = 0
  for (const row of lines) {
    const text = row.text.replace(/\s+$/, '')
    if (!text.trim()) {
      pendingBlank++
      continue
    }
    const last = groups[groups.length - 1]
    if (last && pendingBlank === 0) last.lines.push(row)
    else groups.push({ lines: [row] })
    pendingBlank = 0
  }
  if (groups.length < 2) return null
  const cols = []
  let headerSrc = null
  const out = []
  for (const group of groups) {
    const src = [group.lines[0].n, group.lines[group.lines.length - 1].n]
    const cells = splitRowCells(group.lines.map((l) => l.text).join('   '))
    if (cols.length === 0 && cells.length >= 1 && /^\d*d\d+$/i.test(cells[0].text)) {
      cols.push(cells[0].text, ...cells.slice(1).map((c) => c.text))
      headerSrc = src
      continue
    }
    const pairs = parsePairRow(cells)
    if (!pairs) return null
    for (const pair of pairs) out.push({ ...pair, src })
  }
  if (out.length === 0) return null
  const block = { k: 'table', rows: out.map((p) => ({ c: [p.roll, p.text], s: p.src })) }
  if (cols.length === 2) block.cols = cols
  const first = headerSrc && headerSrc[0] < out[0].src[0] ? headerSrc[0] : out[0].src[0]
  block.s = [first, out[out.length - 1].src[1]]
  return block
}

function assembleStream(tokens, splices) {
  const blocks = []
  let para = null
  let list = null
  const spliceStarts = new Map()
  for (const sp of splices) {
    if (!spliceStarts.has(sp.from)) spliceStarts.set(sp.from, sp)
  }
  let tableRun = null

  function flushTableRun() {
    if (!tableRun) return
    const table = parseTableRun(tableRun)
    if (table) {
      flushAll()
      blocks.push(table)
    } else {
      for (const tok of tableRun) {
        if (tok.text.trim()) {
          if (!para) para = { parts: [] }
          para.parts.push({ n: tok.n, text: tok.text.trim(), indent: tok.indent })
        }
      }
    }
    tableRun = null
  }

  function emitPara(text, src, parts) {
    if (parts.length >= 2 && firstPartHeading(parts[0].text) && /^[A-Z0-9"“'(]/.test(parts[1].text.trim())) {
      blocks.push({ k: 'h', lvl: 1, t: parts[0].text, s: [parts[0].n, parts[0].n] })
      blocks.push({ k: 'p', t: joinFragments(parts.slice(1)), s: [parts[1].n, parts[parts.length - 1].n] })
      return
    }
    if (isAllCapsHeading(text) && parts.length === 1) {
      blocks.push({ k: 'h', lvl: 2, t: text, s: src })
    } else if (looksLikeHeadingPara(text, parts.length)) {
      blocks.push({ k: 'h', lvl: 1, t: text, s: src })
    } else {
      blocks.push({ k: 'p', t: text, s: src })
    }
  }

  function flushPara() {
    if (!para) return
    const text = joinFragments(para.parts)
    const src = [para.parts[0].n, para.parts[para.parts.length - 1].n]
    emitPara(text, src, para.parts)
    para = null
  }

  function flushList() {
    if (!list) return
    const items = list.items.map((item) => ({
      t: joinFragments(item.parts),
      s: [item.parts[0].n, item.parts[item.parts.length - 1].n],
    }))
    const src = [items[0].s[0], items[items.length - 1].s[1]]
    blocks.push(list.ordered ? { k: 'list', ordered: true, items, s: src } : { k: 'list', items, s: src })
    list = null
  }

  function flushAll() {
    flushPara()
    flushList()
  }

  for (let idx = 0; idx < tokens.length; idx++) {
    const tok = tokens[idx]
    const sp = spliceStarts.get(tok.n)
    if (sp) {
      flushAll()
      blocks.push(...sp.blocks)
      spliceStarts.delete(sp.from)
      while (idx + 1 < tokens.length && tokens[idx + 1].n <= sp.to) idx++
      continue
    }
    const text = tok.text.trim()
    if (!text) {
      flushAll()
      continue
    }
    if (isAllCapsHeading(text)) {
      flushAll()
      blocks.push({ k: 'h', lvl: 2, t: text, s: [tok.n, tok.n] })
      continue
    }
    if (tok.fresh && !para && !list && isHeadingShape(text) && !/^[•·]/.test(text)) {
      blocks.push({ k: 'h', lvl: 1, t: text, s: [tok.n, tok.n] })
      continue
    }
    const bullet = text.match(/^[•·]\s*(.*)$/)
    const numbered = text.match(/^(\d{1,2})[.)]\s+(.*)$/)
    if (bullet) {
      flushPara()
      if (!list || list.ordered) {
        flushList()
        list = { ordered: false, items: [] }
      }
      list.items.push({ parts: [{ n: tok.n, text: bullet[1], indent: tok.indent }], marker: tok.indent })
      continue
    }
    if (numbered) {
      flushPara()
      if (!list || !list.ordered) {
        flushList()
        list = { ordered: true, items: [] }
      }
      list.items.push({ parts: [{ n: tok.n, text: numbered[2], indent: tok.indent }], marker: tok.indent })
      continue
    }
    if (list) {
      const last = list.items[list.items.length - 1]
      if (tok.indent > last.marker) {
        last.parts.push({ n: tok.n, text: tok.text.trim(), indent: tok.indent })
        continue
      }
      flushList()
    }
    if (para && isLabelPara(text)) flushPara()
    if (!para) para = { parts: [] }
    para.parts.push({ n: tok.n, text: tok.text.trim(), indent: tok.indent })
  }
  flushAll()
  return blocks
}

function splitRowCells(text) {
  const cells = []
  for (const part of text.split(/ {3,}/)) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const start = text.indexOf(part)
    cells.push({ text: trimmed, start: start + part.length - part.trimStart().length })
  }
  return cells
}

const ROLL_CELL = /^\d{1,3}([–-]\d{1,3})?$/

function parsePairRow(cells) {
  if (cells.length < 2) return null
  const pairs = []
  let current = null
  for (const cell of cells) {
    if (ROLL_CELL.test(cell.text)) {
      if (current) pairs.push(current)
      current = { roll: cell.text, text: '' }
    } else if (current) {
      current.text = current.text ? current.text + ' ' + cell.text : cell.text
    } else {
      return null
    }
  }
  if (current) pairs.push(current)
  if (pairs.some((p) => !p.text)) return null
  return pairs
}

function parseTable(rows) {
  const groups = []
  let pendingBlank = 0
  for (const row of rows) {
    const text = row.text.replace(/\s+$/, '')
    if (!text.trim()) {
      pendingBlank++
      continue
    }
    const last = groups[groups.length - 1]
    if (last && pendingBlank === 0) last.lines.push(row)
    else groups.push({ lines: [row] })
    pendingBlank = 0
  }
  if (groups.length < 2) return null
  let pairCount = 0
  let contentRows = 0
  for (const group of groups) {
    const cells = splitRowCells(group.lines.map((l) => l.text).join('   '))
    if (cells.length < 2) continue
    contentRows++
    if (parsePairRow(cells)) pairCount++
  }
  const firstCells = splitRowCells(groups[0].lines[0].text)
  const diceHeader = firstCells.length >= 1 && /^\d*d\d+$/i.test(firstCells[0].text)
  if (pairCount >= Math.max(1, Math.ceil(contentRows * 0.5)) || (diceHeader && pairCount >= 1)) {
    const cols = []
    let headerSrc = null
    const out = []
    for (const group of groups) {
      const src = [group.lines[0].n, group.lines[group.lines.length - 1].n]
      const cells = splitRowCells(group.lines.map((l) => l.text).join('   '))
      if (cols.length === 0 && cells.length >= 1 && /^\d*d\d+$/i.test(cells[0].text)) {
        cols.push(cells[0].text, ...cells.slice(1).map((c) => c.text))
        headerSrc = src
        continue
      }
      const pairs = parsePairRow(cells)
      if (!pairs) return null
      for (const pair of pairs) out.push({ ...pair, src })
    }
    if (out.length === 0) return null
    const block = { k: 'table', rows: out.map((p) => ({ c: [p.roll, p.text], s: p.src })) }
    if (cols.length === 2) block.cols = cols
    const first = headerSrc && headerSrc[0] < out[0].src[0] ? headerSrc[0] : out[0].src[0]
    block.s = [first, out[out.length - 1].src[1]]
    return block
  }
  return parseBandTable(groups)
}

function parseBandTable(groups) {
  const starts = []
  for (const group of groups) {
    for (const line of group.lines) {
      for (const cell of splitRowCells(line.text)) starts.push(cell.start)
    }
  }
  if (starts.length < 4) return null
  starts.sort((a, b) => a - b)
  const columns = []
  for (const s of starts) {
    const last = columns[columns.length - 1]
    if (last && s - last[1] <= 10) last[1] = Math.max(last[1], s)
    else columns.push([s, s])
  }
  const merged = []
  for (const col of columns) {
    const last = merged[merged.length - 1]
    if (last && col[0] - last[1] < 4) last[1] = col[1]
    else merged.push([...col])
  }
  if (merged.length < 2) return null
  const rows = []
  let headers = null
  let headerSrc = null
  for (const group of groups) {
    const src = [group.lines[0].n, group.lines[group.lines.length - 1].n]
    const buckets = new Map(merged.map((_, i) => [i, []]))
    for (const line of group.lines) {
      for (const cell of splitRowCells(line.text)) {
        let best = 0
        let bestDist = Infinity
        merged.forEach(([lo, hi], i) => {
          const dist = cell.start < lo ? lo - cell.start : cell.start > hi ? cell.start - hi : 0
          if (dist < bestDist) {
            bestDist = dist
            best = i
          }
        })
        if (bestDist > 10) return null
        buckets.get(best).push(cell.text)
      }
    }
    const cells = merged.map((_, i) => (buckets.get(i) ?? []).join(' ').trim())
    if (!headers && rows.length === 0 && cells.every((c) => !ROLL_CELL.test(c)) && cells.filter((c) => c).length >= 2) {
      headers = cells
      headerSrc = src
      continue
    }
    rows.push({ c: cells, s: src })
  }
  if (rows.length === 0) return null
  const used = new Set()
  rows.forEach((r) => r.c.forEach((c, i) => { if (c) used.add(i) }))
  const keep = merged.map((_, i) => used.has(i) || (headers ? Boolean(headers[i]) : false))
  const block = { k: 'table', rows: rows.map((r) => ({ c: r.c.filter((_, i) => keep[i]), s: r.s })) }
  if (headers) block.cols = headers.filter((_, i) => keep[i])
  const first = headerSrc && headerSrc[0] < rows[0].s[0] ? headerSrc[0] : rows[0].s[0]
  block.s = [first, rows[rows.length - 1].s[1]]
  return block
}

function spliceCovers(splices, n) {
  return splices.some((sp) => n >= sp.from && n <= sp.to)
}

function assembleFull(segment, splices) {
  const fullSplices = splices.filter((sp) => sp.side === 'full')
  const blocks = []
  const rows = segment.rows
  let i = 0
  while (i < rows.length) {
    if (spliceCovers(fullSplices, rows[i].n)) {
      const sp = fullSplices.find((s) => rows[i].n >= s.from && rows[i].n <= s.to)
      blocks.push(...sp.blocks)
      const to = sp.to
      i++
      while (i < rows.length && rows[i].n <= to) i++
      continue
    }
    break
  }
  const rest = rows.slice(i).filter((r) => !spliceCovers(fullSplices, r.n))
  if (rest.length === 0) return blocks
  let tableRows = rest
  if (rest.length && splitRowCells(rest[0].text).length === 1) {
    blocks.push({ k: 'h', lvl: 1, t: rest[0].text.trim(), s: [rest[0].n, rest[0].n] })
    tableRows = rest.slice(1)
  }
  const table = parseTable(tableRows)
  if (table) return [...blocks, table]
  const tokens = rest.map((r) => ({ n: r.n, text: r.text.replace(/^ {1,3}/, ''), indent: r.text.length - r.text.trimStart().length, fresh: r.fresh }))
  return [...blocks, ...assembleStream(tokens, [])]
}

export function reflowRange(start, end, lines, splices = []) {
  if (splices.some((sp) => sp.side === 'all' && sp.from <= start && sp.to >= end)) {
    const whole = splices.find((sp) => sp.side === 'all' && sp.from <= start && sp.to >= end)
    return { blocks: whole.blocks, uncovered: [] }
  }
  const rows = []
  for (let n = start; n <= end; n++) {
    const raw = lines[n - 1]
    const fresh = raw.includes('\f')
    const text = raw.replace(/\f/g, '').replace(/\s+$/, '')
    if (isBoilerplate(text)) continue
    rows.push({ n, raw: text, fresh })
  }
  const hasGutter = rows.some(({ raw }) => {
    if (!raw.trim()) return false
    const lead = raw.length - raw.trimStart().length
    if (lead >= GUTTER_MIN_RESUME) return true
    return candidateResumes(raw).length > 0
  })
  const singleColumn = !hasGutter && rows.some(({ raw }) => / {3,}/.test(raw))
  const segments = buildSegments(rows, splices, singleColumn)
  const blocks = []
  for (const segment of segments) {
    if (segment.type === 'spliced') {
      blocks.push(...segment.blocks)
    } else if (segment.type === 'twocol') {
      blocks.push(...assembleStream(segment.left, splices))
      blocks.push(...assembleStream(segment.right, splices))
    } else {
      blocks.push(...assembleFull(segment, splices))
    }
  }
  const spans = []
  for (const block of blocks) {
    if (block.s) spans.push(block.s)
    if (block.items) for (const item of block.items) spans.push(item.s)
    if (block.rows) for (const row of block.rows) spans.push(row.s)
  }
  const splicedSpans = splices.map((sp) => [sp.from, Math.min(sp.to, end)])
  const uncovered = []
  for (let n = start; n <= end; n++) {
    const raw = lines[n - 1].replace(/\f/g, '').replace(/\s+$/, '')
    if (isBoilerplate(raw) || !raw.trim()) continue
    if (spans.some(([s, e]) => n >= s && n <= e)) continue
    if (splicedSpans.some(([s, e]) => n >= s && n <= e)) continue
    uncovered.push(n)
  }
  return { blocks, uncovered }
}
