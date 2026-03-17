import fs from 'node:fs/promises'
import path from 'node:path'

const CSV_COLUMNS = ['nome', 'cidade', 'email', 'telefone', 'site', 'fonte', 'confidence_score']

function escapeCsv(value) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export function toCsv(rows) {
  const header = CSV_COLUMNS.join(',')
  const body = rows
    .map((row) => CSV_COLUMNS.map((column) => escapeCsv(row[column])).join(','))
    .join('\n')

  return `${header}\n${body}${body ? '\n' : ''}`
}

export async function ensureParentDir(filePath) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
}

export async function writeCsv(filePath, rows) {
  await ensureParentDir(filePath)
  await fs.writeFile(filePath, toCsv(rows), 'utf8')
}

export async function writeJson(filePath, payload) {
  await ensureParentDir(filePath)
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

export async function writeJsonLines(filePath, rows) {
  await ensureParentDir(filePath)
  const content = rows.map((row) => JSON.stringify(row)).join('\n')
  await fs.writeFile(filePath, content ? `${content}\n` : '', 'utf8')
}

export async function readJsonLines(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  } catch {
    return []
  }
}
