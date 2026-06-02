export const SLOTS = [
  { id: 'wake',      label: 'Thức dậy',           icon: '☀️', startH: 6,  startM: 0,  endH: 6,  endM: 30,  durationMin: null },
  { id: 'commute',   label: 'Xuất phát đi làm',    icon: '🚗', startH: 7,  startM: 0,  endH: 7,  endM: 30,  durationMin: null },
  { id: 'work',      label: 'Văn phòng',            icon: '💼', startH: 8,  startM: 0,  endH: 17, endM: 30,  durationMin: 570 },
  { id: 'family',    label: 'Gia đình & cơm nước',  icon: '🏠', startH: 18, startM: 0,  endH: 20, endM: 0,   durationMin: 120 },
  { id: 'remote',    label: 'Remote công ty',        icon: '💻', startH: 20, startM: 0,  endH: 22, endM: 30,  durationMin: 150 },
  { id: 'relax',     label: 'Giải trí có chủ đích', icon: '🎮', startH: 22, startM: 30, endH: 23, endM: 30,  durationMin: 60 },
  { id: 'winddown',  label: 'Wind down',             icon: '🌙', startH: 23, startM: 30, endH: 0,  endM: 0,   durationMin: 30 },
  { id: 'sleep',     label: 'Ngủ đúng giờ',          icon: '😴', startH: 0,  startM: 0,  endH: 0,  endM: 30,  durationMin: null },
]

export const BUFFER_MIN = 5

// Returns which remote company for a given date string YYYY-MM-DD
// Mon/Wed/Fri = A, Tue/Thu/Sat = B, Sun = A
export function getRemoteCompany(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() // 0=Sun,1=Mon,...,6=Sat
  return [1, 3, 5].includes(day) ? 'A' : 'B'
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function nowMinutes() {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

export function slotStartMinutes(slot) {
  return slot.startH * 60 + slot.startM
}

export function slotEndMinutes(slot) {
  if (slot.endH === 0 && slot.endM === 0) return 24 * 60
  return slot.endH * 60 + slot.endM
}

// Returns slot status based on current time and check-in data
// 'future' | 'active' | 'missed' | 'on_time' | 'late'
export function getSlotStatus(slot, checkedAt, dateStr) {
  const isToday = dateStr === todayStr()
  const now = nowMinutes()
  const start = slotStartMinutes(slot)
  const end = slotEndMinutes(slot)

  if (checkedAt) {
    const checkedTime = new Date(checkedAt)
    const checkedMin = checkedTime.getHours() * 60 + checkedTime.getMinutes()
    const delay = checkedMin - start
    return delay <= BUFFER_MIN ? 'on_time' : 'late'
  }

  if (!isToday) return 'missed'

  if (now < start - BUFFER_MIN) return 'future'
  if (now >= start - BUFFER_MIN && now <= end + BUFFER_MIN) return 'active'
  if (now > end + BUFFER_MIN) return 'missed'
  return 'future'
}

export function calcDayScore(slots, checkins) {
  if (!checkins || checkins.length === 0) return 0
  let total = 0
  slots.forEach(slot => {
    const ci = checkins.find(c => c.slot_id === slot.id)
    if (!ci || !ci.checked_at) return
    const status = getSlotStatus(slot, ci.checked_at, ci.date)
    if (status === 'on_time') total += 100
    else if (status === 'late') {
      const checkedMin = new Date(ci.checked_at).getHours() * 60 + new Date(ci.checked_at).getMinutes()
      const delay = checkedMin - slotStartMinutes(slot)
      const score = Math.max(0, 100 - Math.floor(delay / 5) * 10)
      total += score
    }
  })
  return Math.round(total / slots.length)
}

export function formatTime(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDateVi(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
}
