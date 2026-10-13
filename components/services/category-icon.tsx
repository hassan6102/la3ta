import {Camera, Palette, Scissors, Sparkles, Video, type LucideIcon} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  photography: Camera,
  video: Video,
  editing: Scissors,
  design: Palette,
}

/** Icons are a UI concern; categories added later from the admin fall back to a generic icon. */
export function CategoryIcon({id, className}: {id: string; className?: string}) {
  const Icon = ICONS[id] ?? Sparkles
  return <Icon aria-hidden className={className} />
}
