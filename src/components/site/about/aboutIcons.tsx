import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BarChart3,
  Boxes,
  Building2,
  Code2,
  Eye,
  Layers,
  Lightbulb,
  Package,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  boxes: Boxes,
  sparkles: Sparkles,
  eye: Eye,
  rocket: Rocket,
  settings: Settings,
  'building-2': Building2,
  package: Package,
  award: Award,
  layers: Layers,
  search: Search,
  wrench: Wrench,
  'bar-chart-3': BarChart3,
  'refresh-cw': RefreshCw,
  target: Target,
  'code-2': Code2,
  lightbulb: Lightbulb,
}

export function AboutIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Sparkles
  return <Icon className={className} aria-hidden />
}

export const ABOUT_ICON_OPTIONS = [
  { value: 'boxes', label: 'Kutular' },
  { value: 'sparkles', label: 'Yıldız' },
  { value: 'eye', label: 'Göz' },
  { value: 'rocket', label: 'Roket' },
  { value: 'settings', label: 'Ayar' },
  { value: 'building-2', label: 'Bina' },
  { value: 'package', label: 'Paket' },
  { value: 'award', label: 'Ödül' },
  { value: 'layers', label: 'Katman' },
  { value: 'search', label: 'Arama' },
  { value: 'wrench', label: 'Anahtar' },
  { value: 'bar-chart-3', label: 'Grafik' },
  { value: 'refresh-cw', label: 'Yenile' },
  { value: 'target', label: 'Hedef' },
  { value: 'code-2', label: 'Kod' },
  { value: 'lightbulb', label: 'Ampul' },
] as const
