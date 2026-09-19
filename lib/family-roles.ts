// Who an adult is to the children. Display-only: access is decided by role.
export const FAMILY_RELATIONSHIPS = [
  { id: 'mother', label: 'Mother' },
  { id: 'father', label: 'Father' },
  { id: 'step-mother', label: 'Step-mother' },
  { id: 'step-father', label: 'Step-father' },
  { id: 'grandmother', label: 'Grandmother' },
  { id: 'grandfather', label: 'Grandfather' },
  { id: 'aunt', label: 'Aunt' },
  { id: 'uncle', label: 'Uncle' },
  { id: 'family-friend', label: 'Family friend' },
  { id: 'other', label: 'Other' },
] as const

export type FamilyRelationshipId = (typeof FAMILY_RELATIONSHIPS)[number]['id']

export function isFamilyRelationshipId(value: unknown): value is FamilyRelationshipId {
  return (
    typeof value === 'string' &&
    FAMILY_RELATIONSHIPS.some((relationship) => relationship.id === value)
  )
}

export function familyRelationshipLabel(value?: string | null) {
  if (!value) return undefined
  return FAMILY_RELATIONSHIPS.find((relationship) => relationship.id === value)?.label
}

// What an adult may do in the household.
export const FAMILY_ROLES = ['owner', 'editor', 'viewer'] as const

export type FamilyRoleId = (typeof FAMILY_ROLES)[number]

export function isFamilyRoleId(value: unknown): value is FamilyRoleId {
  return typeof value === 'string' && FAMILY_ROLES.includes(value as FamilyRoleId)
}

export function canEditFamily(role: string) {
  return role === 'owner' || role === 'editor'
}

// Inviting, removing, and changing roles. Co-parents are equals, so a household
// can have more than one owner.
export function canManageFamily(role: string) {
  return role === 'owner'
}

const PARENT_RELATIONSHIP_IDS: string[] = ['mother', 'father', 'step-mother', 'step-father']

// Relationship never grants access on its own - it only preselects the role on
// an invite, which the sender can override.
export function defaultRoleForRelationship(relationship?: string | null): FamilyRoleId {
  if (relationship && PARENT_RELATIONSHIP_IDS.includes(relationship)) return 'owner'
  return 'viewer'
}

export function familyRoleLabel(role: string) {
  if (role === 'owner') return 'Owner'
  if (role === 'editor') return 'Can log songs'
  return 'View only'
}
