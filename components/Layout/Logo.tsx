import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  className?: string
}

export default function Logo({ href = '/', className = 'h-9 w-auto' }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/MILESTONES3.png"
        alt="Milestones"
        width={200}
        height={50}
        className={`${className} rounded-md`}
        priority
      />
    </Link>
  )
}
