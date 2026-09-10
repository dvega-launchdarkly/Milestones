import { DEFAULT_CHILD_ICON, isChildIconId } from './child-icon-ids'

export function parseChildInput(body: {
  firstName?: unknown
  lastName?: unknown
  birthDate?: unknown
  icon?: unknown
}) {
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
  const birthDate = typeof body.birthDate === 'string' ? body.birthDate : ''
  const icon = typeof body.icon === 'string' && isChildIconId(body.icon) ? body.icon : DEFAULT_CHILD_ICON

  if (!firstName || !lastName || !birthDate) {
    return { error: 'First name, last name, and birth date are required' as const }
  }

  return { firstName, lastName, birthDate, icon }
}
