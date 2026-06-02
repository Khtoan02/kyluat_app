import { useEffect, useRef } from 'react'
import { SLOTS, getSlotStatus, todayStr } from '../lib/slots'

export function useNotifications(checkins) {
  const notifiedRef = useRef({})

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Notification.permission !== 'granted') return
      const today = todayStr()
      SLOTS.forEach(slot => {
        const ci = checkins.find(c => c.slot_id === slot.id && c.date === today)
        const status = getSlotStatus(slot, ci?.checked_at, today)
        const key = `${today}-${slot.id}`
        if (status === 'missed' && !notifiedRef.current[key]) {
          notifiedRef.current[key] = true
          new Notification('⚠️ Kỷ Luật — Bỏ lỡ!', {
            body: `Bạn đã bỏ qua: ${slot.icon} ${slot.label}`,
            icon: '/logo192.png',
            tag: key,
          })
        }
      })
    }, 60 * 1000) // check every minute
    return () => clearInterval(interval)
  }, [checkins])
}
