export const DEFAULT_CHILD_ICON = 'baby'

export const CHILD_ICON_IDS = [
  'baby',
  'smile',
  'heart',
  'star',
  'sparkles',
  'sun',
  'moon',
  'rainbow',
  'cloud-sun',
  'cat',
  'dog',
  'rabbit',
  'bird',
  'fish',
  'turtle',
  'snail',
  'paw-print',
  'bug',
  'flower',
  'clover',
  'apple',
  'banana',
  'cherry',
  'cookie',
  'ice-cream',
  'pizza',
  'music',
  'headphones',
  'rocket',
  'gamepad',
  'palette',
  'crown',
  'ghost',
  'umbrella',
] as const

export type ChildIconId = (typeof CHILD_ICON_IDS)[number]

export function isChildIconId(value: string): value is ChildIconId {
  return (CHILD_ICON_IDS as readonly string[]).includes(value)
}

export function childDisplayName(child: { firstName: string; lastName: string }) {
  return [child.firstName, child.lastName].filter(Boolean).join(' ')
}
