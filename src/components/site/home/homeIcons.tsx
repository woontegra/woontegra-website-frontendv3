import type { LucideIcon } from 'lucide-react'
import {
  Award,
  CheckCircle,
  Cloud,
  Code,
  Lightbulb,
  Palette,
  Scale,
  ShoppingCart,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  code: Code,
  palette: Palette,
  'shopping-cart': ShoppingCart,
  cloud: Cloud,
  scale: Scale,
  lightbulb: Lightbulb,
  award: Award,
  target: Target,
  zap: Zap,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
}

export function HomeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Code
  return <Icon className={className} />
}

export const HOME_ICON_OPTIONS = [
  { value: 'code', label: 'Kod' },
  { value: 'palette', label: 'Tasarım' },
  { value: 'shopping-cart', label: 'E-ticaret' },
  { value: 'cloud', label: 'Bulut' },
  { value: 'scale', label: 'Hukuk' },
  { value: 'lightbulb', label: 'Danışmanlık' },
  { value: 'award', label: 'Ödül' },
  { value: 'target', label: 'Hedef' },
  { value: 'zap', label: 'Performans' },
  { value: 'trending-up', label: 'Büyüme' },
  { value: 'check-circle', label: 'Onay' },
] as const
