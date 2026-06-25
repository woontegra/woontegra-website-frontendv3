import type { LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Box } from 'lucide-react'

export const ICON_OPTIONS = [
  'Globe',
  'ShoppingCart',
  'Search',
  'Megaphone',
  'Share2',
  'Palette',
  'Lightbulb',
  'Code2',
  'Target',
  'Workflow',
  'Zap',
  'BarChart3',
  'Package',
  'Truck',
  'RefreshCw',
  'Boxes',
  'LayoutDashboard',
  'Layers',
  'Database',
  'Settings',
  'Users',
  'Cloud',
  'Monitor',
  'Smartphone',
  'Layout',
  'TrendingUp',
  'Shield',
  'CreditCard',
  'Activity',
  'Lock',
  'Scale',
  'FileCheck',
  'Gamepad2',
  'Cpu',
  'Sparkles',
] as const

export type IconName = (typeof ICON_OPTIONS)[number]

const iconMap = LucideIcons as unknown as Record<string, LucideIcon | undefined>

export function resolveIcon(name?: string): LucideIcon {
  if (!name?.trim()) return Box
  const Icon = iconMap[name]
  return Icon ?? Box
}

export const GRADIENT_OPTIONS = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-fuchsia-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-slate-700 to-slate-900',
  'from-purple-500 to-indigo-500',
  'from-sky-500 to-blue-600',
  'from-slate-600 to-slate-800',
] as const
