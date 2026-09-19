import { createHash, randomBytes } from 'crypto'

export const INVITE_TTL_DAYS = 7

/**
 * The raw token goes in the invite link and is never stored. Only its hash is
 * persisted, so a leaked database can't be used to join a family.
 */
export function createInviteToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, tokenHash: hashInviteToken(token) }
}

export function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function inviteExpiryDate(from: Date = new Date()) {
  return new Date(from.getTime() + INVITE_TTL_DAYS * 86_400_000)
}

export function invitePath(token: string) {
  return `/invite/${token}`
}

export function isInviteUsable(invite: { status: string; expiresAt: Date }, now = new Date()) {
  return invite.status === 'pending' && invite.expiresAt.getTime() > now.getTime()
}

/**
 * Only same-origin paths are safe to hand to Clerk as a post-auth redirect.
 */
export function safeRedirectPath(value?: string | null) {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  return value
}
