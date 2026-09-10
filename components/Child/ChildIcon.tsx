import { getChildIcon } from '@/lib/child-icons'

interface ChildIconProps {
  icon: string
  className?: string
}

export default function ChildIcon({ icon, className = 'h-6 w-6' }: ChildIconProps) {
  const Icon = getChildIcon(icon)
  return <Icon className={className} aria-hidden />
}
