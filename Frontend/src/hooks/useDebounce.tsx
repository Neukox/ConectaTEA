import { useCallback, useRef, useMemo, useLayoutEffect } from 'react'

export default function useDebounce(
  callback: (...args: any[]) => void,
  delay: number = 300,
) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debounce = (
    func: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      func(...args)
    }, delay)
  }

  return useMemo(() => {
    return (...args: any[]) => debounce(callbackRef.current, delay, ...args)
  }, [delay])
}
