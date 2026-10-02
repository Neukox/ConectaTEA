import { format, parseISO } from 'date-fns'

export function parseSessionDateString(dateString: string): Date {
  return parseISO(dateString)
}

export function toOffsetDateTime(date: string, time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const localDateTime = parseISO(date)
  localDateTime.setHours(hours, minutes, 0, 0)
  return format(localDateTime, "yyyy-MM-dd'T'HH:mm:ssxxx")
}
