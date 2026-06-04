export const SLOTS = [
  { id: 'sleep',     label: 'Ngủ đúng giờ',          icon: 'sleep',    startH: 0,  startM: 0,  endH: 6,  endM: 0,   durationMin: 360 },
  { id: 'wake',      label: 'Thức dậy',           icon: 'wake',     startH: 6,  startM: 0,  endH: 6,  endM: 30,  durationMin: null },
  { id: 'commute',   label: 'Xuất phát đi làm',    icon: 'commute',  startH: 7,  startM: 0,  endH: 7,  endM: 30,  durationMin: null },
  { id: 'work',      label: 'Văn phòng',            icon: 'work',     startH: 8,  startM: 0,  endH: 17, endM: 30,  durationMin: 570 },
  { id: 'family',    label: 'Gia đình & cơm nước',  icon: 'family',   startH: 18, startM: 0,  endH: 20, endM: 0,   durationMin: 120 },
  { id: 'remote',    label: 'Remote công ty',        icon: 'remote',   startH: 20, startM: 0,  endH: 22, endM: 30,  durationMin: 150 },
  { id: 'relax',     label: 'Giải trí có chủ đích', icon: 'relax',    startH: 22, startM: 30, endH: 23, endM: 30,  durationMin: 60 },
  { id: 'winddown',  label: 'Wind down',             icon: 'winddown', startH: 23, startM: 30, endH: 0,  endM: 0,   durationMin: 30 },
]

export const BUFFER_MIN = 5

// Returns which remote company for a given date string YYYY-MM-DD
// Mon/Wed/Fri = A, Tue/Thu/Sat = B, Sun = A
export function getRemoteCompany(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() // 0=Sun,1=Mon,...,6=Sat
  return [1, 3, 5].includes(day) ? 'HacoLED' : 'TavaLED'
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
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

export function getSlotDelay(slot, checkedAt, dateStr) {
  if (!checkedAt) return 0
  const checkedTime = new Date(checkedAt)
  const [yr, mo, dy] = dateStr.split('-').map(Number)
  const scheduledStart = new Date(yr, mo - 1, dy, slot.startH, slot.startM, 0)
  return Math.round((checkedTime.getTime() - scheduledStart.getTime()) / (1000 * 60))
}

export function getSlotScore(slot, checkedAt, dateStr, status) {
  if (status === 'in_progress') return null
  if (checkedAt) {
    const delay = getSlotDelay(slot, checkedAt, dateStr)
    if (delay <= BUFFER_MIN) return 100
    return Math.max(0, 100 - Math.floor(delay / 5) * 10)
  }
  const currentStatus = getSlotStatus(slot, checkedAt, dateStr, status)
  if (currentStatus === 'missed') return 0
  return null
}

// Returns slot status based on current time and check-in data
// 'future' | 'active' | 'missed' | 'on_time' | 'late' | 'in_progress'
export function getSlotStatus(slot, checkedAt, dateStr, status) {
  const today = todayStr()
  const isToday = dateStr === today
  const isTomorrow = dateStr === tomorrowStr()
  const now = nowMinutes()
  const start = slotStartMinutes(slot)
  const end = slotEndMinutes(slot)

  if (checkedAt) {
    if (status === 'in_progress') return 'in_progress'
    const delay = getSlotDelay(slot, checkedAt, dateStr)
    return delay <= BUFFER_MIN ? 'on_time' : 'late'
  }

  if (dateStr < today) {
    return 'missed'
  }

  if (dateStr > today) {
    if (isTomorrow && slot.id === 'sleep' && nowMinutes() >= 23 * 60 + 30) {
      return 'active'
    }
    return 'future'
  }

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
    if (!ci || !ci.checked_at || ci.status === 'in_progress') return
    const score = getSlotScore(slot, ci.checked_at, ci.date, ci.status)
    if (score !== null) {
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
