import { useState, useEffect } from 'react'

const XLSX_CDN_URL =
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js'

export function useXlsx() {
  const [xlsx, setXlsx] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const win = window as any
    if (win.XLSX) {
      setXlsx(win.XLSX)
      setIsLoading(false)
      return
    }

    const script = document.createElement('script')
    script.src = XLSX_CDN_URL
    script.async = true

    const handleLoad = () => {
      if (win.XLSX) {
        setXlsx(win.XLSX)
      } else {
        setError(new Error('XLSX library failed to load from CDN.'))
      }
      setIsLoading(false)
    }

    const handleError = () => {
      setError(new Error('Failed to load XLSX script from CDN.'))
      setIsLoading(false)
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
  }, [])

  return { xlsx, isLoading, error }
}
