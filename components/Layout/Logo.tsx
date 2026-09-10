import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  className?: string
}

export default function Logo({ href = '/', className = 'h-16 w-auto sm:h-20 md:h-24' }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/MILESTONES.png"
        alt="Milestones"
        width={1000}
        height={250}
        className={className}
        priority
      />
    </Link>
  )
}
