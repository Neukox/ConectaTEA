import { parseISO } from 'date-fns'

export function parseSessionDateString(dateString: string): Date {
  return parseISO(dateString)
}
