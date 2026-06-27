/**
 * Public görsel denetimi — backend script sarmalayıcısı.
 * Kullanım: node scripts/check-public-images.mjs
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const script = path.resolve(fileURLToPath(import.meta.url), '../../../backend/scripts/check-public-images.mjs')
const args = process.argv.slice(2)
const r = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' })
process.exit(r.status ?? 1)
