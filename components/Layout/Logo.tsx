import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  className?: string
}

// The wordmark is 4:1, so it needs a small height on phones to leave room for
// the rest of the nav row.
export default function Logo({ href = '/', className = 'h-10 w-auto sm:h-20 md:h-24' }: LogoProps) {
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
