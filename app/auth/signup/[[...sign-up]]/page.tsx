import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <SignUp
      path="/auth/signup"
      routing="path"
      signInUrl="/auth/login"
      afterSignUpUrl="/dashboard"
    />
  )
}
