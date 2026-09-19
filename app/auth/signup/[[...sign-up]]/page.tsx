import { safeRedirectPath } from '@/lib/invites'
import { SignUp } from '@clerk/nextjs'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string }
}) {
  const redirectPath = safeRedirectPath(searchParams.redirect_url)

  return (
    <SignUp
      path="/auth/signup"
      routing="path"
      signInUrl={
        redirectPath
          ? `/auth/login?redirect_url=${encodeURIComponent(redirectPath)}`
          : '/auth/login'
      }
      afterSignUpUrl={redirectPath ?? '/dashboard'}
    />
  )
}
