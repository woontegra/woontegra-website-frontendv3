import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = fs.readFileSync(path.join(__dirname, '../../frontend/src/data/serviceDetailContent.ts'), 'utf8')

const imgMap = {
  'frontendImages.softwareHero': '/images/yazilim.png',
  'frontendImages.webDesignHero': '/images/web-tasarim.png',
  'frontendImages.ecommerceHero': '/images/e-ticaret.jpeg',
  'frontendImages.saasDashboard': '/images/saas-dashboard.jpg',
  'frontendImages.trademarkDocument': '/images/marka-patent-belge.jpg',
  'frontendImages.gameScene': '/images/oyun-sahne.jpg',
  'frontendImages.consultingDashboard': '/images/dijital-danismanlik.jpg',
}

let out = src.replace(/import type \{ LucideIcon \}[^\n]*\n/, '')
out = out.replace(/import \{[\s\S]*?\} from 'lucide-react'\n/, '')
out = out.replace(/import \{ frontendImages \}[^\n]*\n/, '')
out = `// Ported from frontend serviceDetailContent.ts\n${out}`

for (const [k, v] of Object.entries(imgMap)) {
  out = out.split(k).join(`'${v}'`)
}
out = out.replace(/icon: LucideIcon/g, 'icon: string')
out = out.replace(/\bicon: ([A-Z][A-Za-z0-9]+)/g, "icon: '$1'")

const dest = path.join(__dirname, '../src/data/serviceDetailContent.ts')
fs.writeFileSync(dest, out)
console.log('Wrote', dest, out.length, 'bytes')
