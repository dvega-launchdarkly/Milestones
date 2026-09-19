export const LD_CONTEXT_REFRESH_EVENT = 'milestones:ld-context-refresh'

export const ANONYMOUS_LD_CONTEXT = {
  kind: 'user' as const,
  key: 'anonymous',
  anonymous: true,
}

export type FamilyRole = 'owner' | 'editor' | 'viewer'
export type AgeBand = 'infant' | 'toddler' | 'preschool' | 'school-age' | 'teen'

export type LdUserAttributes = {
  key: string
  email?: string
  name?: string
  emailDomain?: string
  createdAt?: string
  accountAgeDays?: number
  role: FamilyRole
  relationship?: string
  childCount: number
  hasChildren: boolean
  hasLoggedSong: boolean
  interactionCount: number
}

export type LdFamilyAttributes = {
  key: string
  childCount: number
  hasChildren: boolean
  familyMemberCount: number
  relationships?: string[]
  youngestChildAgeMonths?: number
  oldestChildAgeMonths?: number
  ageBands?: AgeBand[]
}

export type LdMultiContext = {
  kind: 'multi'
  user: LdUserAttributes
  family: LdFamilyAttributes
}

export type LdSingleUserContext = ReturnType<typeof buildClerkOnlyUserContext>

export type LdContext = typeof ANONYMOUS_LD_CONTEXT | LdSingleUserContext | LdMultiContext

export type LdContextSource = {
  clerkUserId: string
  email?: string | null
  name?: string | null
  accountCreatedAt?: Date | number | string | null
  familyId: string
  role?: FamilyRole
  relationship?: string | null
  childBirthDates: Date[]
  interactionCount: number
  familyMemberCount: number
  relationships?: string[]
}

const AGE_BAND_ORDER: AgeBand[] = ['infant', 'toddler', 'preschool', 'school-age', 'teen']

export function requestLdContextRefresh() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(LD_CONTEXT_REFRESH_EVENT))
}

export function emailDomainFrom(email?: string | null) {
  if (!email) return undefined
  const domain = email.split('@')[1]?.trim().toLowerCase()
  return domain || undefined
}

export function toIsoDate(value?: Date | number | string | null) {
  if (value == null || value === '') return undefined
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

export function accountAgeDaysFrom(value?: Date | number | string | null, now = new Date()) {
  const iso = toIsoDate(value)
  if (!iso) return undefined
  const created = new Date(iso)
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86_400_000))
}

export function ageInMonths(birthDate: Date, now = new Date()) {
  let months =
    (now.getUTCFullYear() - birthDate.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - birthDate.getUTCMonth())
  if (now.getUTCDate() < birthDate.getUTCDate()) months -= 1
  return Math.max(0, months)
}

export function ageBandFromMonths(months: number): AgeBand {
  if (months < 12) return 'infant'
  if (months < 36) return 'toddler'
  if (months < 60) return 'preschool'
  if (months < 144) return 'school-age'
  return 'teen'
}

export function buildClerkOnlyUserContext(input: {
  id: string
  email?: string | null
  name?: string | null
  createdAt?: Date | number | string | null
}): { kind: 'user' } & Omit<
  LdUserAttributes,
  'role' | 'relationship' | 'childCount' | 'hasChildren' | 'hasLoggedSong' | 'interactionCount'
> {
  const email = input.email?.trim() || undefined
  const name = input.name?.trim() || undefined

  return omitUndefined({
    kind: 'user' as const,
    key: input.id,
    email,
    name,
    emailDomain: emailDomainFrom(email),
    createdAt: toIsoDate(input.createdAt),
    accountAgeDays: accountAgeDaysFrom(input.createdAt),
  })
}

export function buildLdMultiContext(source: LdContextSource): LdMultiContext {
  const email = source.email?.trim() || undefined
  const name = source.name?.trim() || undefined
  const childCount = source.childBirthDates.length
  const ages = source.childBirthDates.map((date) => ageInMonths(date))
  const ageBands = AGE_BAND_ORDER.filter((band) => ages.some((months) => ageBandFromMonths(months) === band))

  const user = omitUndefined({
    key: source.clerkUserId,
    email,
    name,
    emailDomain: emailDomainFrom(email),
    createdAt: toIsoDate(source.accountCreatedAt),
    accountAgeDays: accountAgeDaysFrom(source.accountCreatedAt),
    role: source.role ?? 'owner',
    relationship: source.relationship ?? undefined,
    childCount,
    hasChildren: childCount > 0,
    hasLoggedSong: source.interactionCount > 0,
    interactionCount: source.interactionCount,
  }) satisfies LdUserAttributes

  const family = omitUndefined({
    key: source.familyId,
    childCount,
    hasChildren: childCount > 0,
    familyMemberCount: source.familyMemberCount,
    relationships: source.relationships?.length ? source.relationships : undefined,
    youngestChildAgeMonths: ages.length ? Math.min(...ages) : undefined,
    oldestChildAgeMonths: ages.length ? Math.max(...ages) : undefined,
    ageBands: ageBands.length ? ageBands : undefined,
  }) satisfies LdFamilyAttributes

  return {
    kind: 'multi',
    user,
    family,
  }
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T
}
