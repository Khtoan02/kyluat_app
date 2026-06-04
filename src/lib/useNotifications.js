import { useEffect, useRef } from 'react'
import { SLOTS, getSlotStatus, todayStr, minutesUntilStart } from '../lib/slots'

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
      const now = new Date()
      
      SLOTS.forEach(slot => {
        const keyMissed = `${today}-${slot.id}-missed`
        const keyUpcoming = `${today}-${slot.id}-upcoming`
        
        // 1. Check for upcoming tasks (starts in 10 minutes or less)
        const diff = minutesUntilStart(slot, now)
        if (diff > 0 && diff <= 10 && !notifiedRef.current[keyUpcoming]) {
          notifiedRef.current[keyUpcoming] = true
          
          const timeStr = `${String(slot.startH).padStart(2, '0')}:${String(slot.startM).padStart(2, '0')}`
          new Notification('⏰ Sắp đến giờ nhiệm vụ mới!', {
            body: `Nhiệm vụ "${slot.label}" sẽ bắt đầu vào lúc ${timeStr}. Hãy chuẩn bị nhé!`,
            icon: '/logo192.png',
            tag: keyUpcoming,
          })
        }

        // 2. Check for missed tasks
        const ci = checkins.find(c => c.slot_id === slot.id && c.date === today)
        const status = getSlotStatus(slot, ci?.checked_at, today)
        if (status === 'missed' && !notifiedRef.current[keyMissed]) {
          notifiedRef.current[keyMissed] = true
          new Notification('⚠️ Kỷ Luật — Bỏ lỡ!', {
            body: `Bạn đã bỏ qua: ${slot.label}`,
            icon: '/logo192.png',
            tag: keyMissed,
          })
        }
      })
    }, 60 * 1000) // check every minute
    return () => clearInterval(interval)
  }, [checkins])
}
