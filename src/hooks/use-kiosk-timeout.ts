import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useKioskTimeout(timeoutMs = 5 * 60 * 1000) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (location.pathname !== '/kiosk') {
          navigate('/kiosk')
        }
      }, timeoutMs)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach((e) => document.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach((e) => document.removeEventListener(e, resetTimer))
    }
  }, [navigate, location.pathname, timeoutMs])
}
