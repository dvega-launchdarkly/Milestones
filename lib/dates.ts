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
