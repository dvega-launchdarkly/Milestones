import { safeRedirectPath } from '@/lib/invites'
import { SignIn } from '@clerk/nextjs'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string }
}) {
  const redirectPath = safeRedirectPath(searchParams.redirect_url)

  return (
    <SignIn
      path="/auth/login"
      routing="path"
      signUpUrl={
        redirectPath
          ? `/auth/signup?redirect_url=${encodeURIComponent(redirectPath)}`
          : '/auth/signup'
      }
      afterSignInUrl={redirectPath ?? '/dashboard'}
    />
  )
}
