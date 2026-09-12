/** Calendar dates only. Avoids UTC midnight shifting to the previous local day. */

export function parseDateOnly(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    throw new Error('Invalid date')
  }

  const [, year, month, day] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
}

export function toDateInputValue(value: string) {
  return value.slice(0, 10)
}

export function formatDateOnly(value: string) {
  return parseDateOnly(value).toLocaleDateString('en-US', { timeZone: 'UTC' })
}

export function formatAge(value: string, now = new Date()) {
  const birthDate = parseDateOnly(value)
  let months =
    (now.getUTCFullYear() - birthDate.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - birthDate.getUTCMonth())
  if (now.getUTCDate() < birthDate.getUTCDate()) months -= 1
  months = Math.max(0, months)

  if (months < 12) {
    return months === 1 ? '1 month old' : `${months} months old`
  }

  const years = Math.floor(months / 12)
  return years === 1 ? '1 year old' : `${years} years old`
}
