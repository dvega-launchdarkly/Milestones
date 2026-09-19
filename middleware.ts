import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/auth/login',
    '/auth/login/(.*)',
    '/auth/signup',
    '/auth/signup/(.*)',
    // Invite links must open for signed-out people; the routes check auth themselves.
    '/invite/(.*)',
    '/api/invites/(.*)',
  ],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
