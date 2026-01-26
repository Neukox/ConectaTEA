import { parse } from 'date-fns'

export function parseSessionDateString(
  dateString: string,
  format: string = 'dd/MM/yyyy, HH:mm:ss',
): Date {
  //const [datePart] = dateString.split(', ')
  return parse(dateString, format, new Date())
}
