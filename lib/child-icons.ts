import { DEFAULT_CHILD_ICON } from './child-icon-ids'
import {
  Apple,
  Baby,
  Banana,
  Bird,
  Bug,
  Cat,
  Cherry,
  CloudSun,
  Clover,
  Cookie,
  Crown,
  Dog,
  Fish,
  Flower2,
  Gamepad2,
  Ghost,
  Headphones,
  Heart,
  IceCream,
  Moon,
  Music,
  Palette,
  PawPrint,
  Pizza,
  Rabbit,
  Rainbow,
  Rocket,
  Smile,
  Snail,
  Sparkles,
  Star,
  Sun,
  Turtle,
  Umbrella,
  type LucideIcon,
} from 'lucide-react'

export { childDisplayName, DEFAULT_CHILD_ICON, isChildIconId } from './child-icon-ids'
export type { ChildIconId } from './child-icon-ids'

export const CHILD_ICONS = [
  { id: 'baby', label: 'Baby', Icon: Baby },
  { id: 'smile', label: 'Smile', Icon: Smile },
  { id: 'heart', label: 'Heart', Icon: Heart },
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'sun', label: 'Sun', Icon: Sun },
  { id: 'moon', label: 'Moon', Icon: Moon },
  { id: 'rainbow', label: 'Rainbow', Icon: Rainbow },
  { id: 'cloud-sun', label: 'Cloud', Icon: CloudSun },
  { id: 'cat', label: 'Cat', Icon: Cat },
  { id: 'dog', label: 'Dog', Icon: Dog },
  { id: 'rabbit', label: 'Rabbit', Icon: Rabbit },
  { id: 'bird', label: 'Bird', Icon: Bird },
  { id: 'fish', label: 'Fish', Icon: Fish },
  { id: 'turtle', label: 'Turtle', Icon: Turtle },
  { id: 'snail', label: 'Snail', Icon: Snail },
  { id: 'paw-print', label: 'Paw', Icon: PawPrint },
  { id: 'bug', label: 'Bug', Icon: Bug },
  { id: 'flower', label: 'Flower', Icon: Flower2 },
  { id: 'clover', label: 'Clover', Icon: Clover },
  { id: 'apple', label: 'Apple', Icon: Apple },
  { id: 'banana', label: 'Banana', Icon: Banana },
  { id: 'cherry', label: 'Cherry', Icon: Cherry },
  { id: 'cookie', label: 'Cookie', Icon: Cookie },
  { id: 'ice-cream', label: 'Ice cream', Icon: IceCream },
  { id: 'pizza', label: 'Pizza', Icon: Pizza },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'headphones', label: 'Headphones', Icon: Headphones },
  { id: 'rocket', label: 'Rocket', Icon: Rocket },
  { id: 'gamepad', label: 'Gamepad', Icon: Gamepad2 },
  { id: 'palette', label: 'Palette', Icon: Palette },
  { id: 'crown', label: 'Crown', Icon: Crown },
  { id: 'ghost', label: 'Ghost', Icon: Ghost },
  { id: 'umbrella', label: 'Umbrella', Icon: Umbrella },
] as const

const iconMap = Object.fromEntries(CHILD_ICONS.map((item) => [item.id, item.Icon])) as Record<
  string,
  LucideIcon
>

export function getChildIcon(id: string): LucideIcon {
  return iconMap[id] ?? iconMap[DEFAULT_CHILD_ICON]
}
