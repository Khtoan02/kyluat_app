import { getSlotStatus, slotStartMinutes, formatTime, BUFFER_MIN } from '../lib/slots'
import { todayStr } from '../lib/slots'

const STATUS_CONFIG = {
  future:   { label: 'Sắp tới',   cls: 'future'   },
  active:   { label: 'Đang diễn', cls: 'active'   },
  on_time:  { label: 'Đúng giờ',  cls: 'on-time'  },
  late:     { label: 'Trễ',       cls: 'late'      },
  missed:   { label: 'Bỏ lỡ',    cls: 'missed'   },
}

export default function SlotCard({ slot, checkin, dateStr, onToggle, remoteCompany }) {
  const status = getSlotStatus(slot, checkin?.checked_at, dateStr)
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.future
  const isToday = dateStr === todayStr()
  const canCheck = isToday && (status === 'active' || status === 'future' || status === 'on_time' || status === 'late')
  const isChecked = !!checkin?.checked_at

  let delayText = ''
  if (isChecked && checkin?.checked_at) {
    const checkedMin = new Date(checkin.checked_at).getHours() * 60 + new Date(checkin.checked_at).getMinutes()
    const delay = checkedMin - slotStartMinutes(slot)
    if (delay <= BUFFER_MIN) delayText = '✓ Đúng giờ'
    else delayText = `+${delay} phút`
  }

  const label = slot.id === 'remote'
    ? `${slot.label} ${remoteCompany}`
    : slot.label

  const timeLabel = slot.endH === slot.startH && slot.endM === slot.startM
    ? formatTime(slot.startH, slot.startM)
    : `${formatTime(slot.startH, slot.startM)} – ${slot.endH === 0 && slot.endM === 0 ? '00:00' : formatTime(slot.endH, slot.endM)}`

  // Score for this slot
  let score = null
  if (isChecked) {
    if (delayText === '✓ Đúng giờ') score = 100
    else {
      const checkedMin = new Date(checkin.checked_at).getHours() * 60 + new Date(checkin.checked_at).getMinutes()
      const delay = checkedMin - slotStartMinutes(slot)
      score = Math.max(0, 100 - Math.floor(delay / 5) * 10)
    }
  } else if (status === 'missed') {
    score = 0
  }

  return (
    <div
      className={`slot-card ${cfg.cls} ${isChecked ? 'checked' : ''}`}
      onClick={() => canCheck && onToggle(slot.id)}
      role={canCheck ? 'button' : undefined}
      tabIndex={canCheck ? 0 : undefined}
    >
      <div className="slot-icon">{slot.icon}</div>
      <div className="slot-info">
        <div className="slot-label">{label}</div>
        <div className="slot-time">{timeLabel}</div>
      </div>
      <div className="slot-right">
        {score !== null && (
          <div className={`slot-score ${score === 100 ? 'perfect' : score >= 60 ? 'ok' : 'bad'}`}>
            {score}%
          </div>
        )}
        <div className={`slot-badge ${cfg.cls}`}>{cfg.label}</div>
        {delayText && <div className="slot-delay">{delayText}</div>}
        {isChecked && <div className="slot-check">✓</div>}
      </div>
    </div>
  )
}
