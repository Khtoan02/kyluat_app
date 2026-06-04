import React from 'react'
import { getSlotStatus, formatTime, BUFFER_MIN, todayStr, tomorrowStr, nowMinutes, getSlotDelay, getSlotScore } from '../lib/slots'
import { 
  IconCheck, IconLightning, IconWork, ICON_MAP
} from './Icons'

const STATUS_CONFIG = {
  future:      { label: 'Sắp tới',               cls: 'future'      },
  active:      { label: 'Bạn đang làm cái này? 🤔', cls: 'active'      },
  in_progress: { label: 'Đang thực hiện...',     cls: 'in-progress' },
  on_time:     { label: 'Đúng giờ',              cls: 'on-time'     },
  late:        { label: 'Trễ',                   cls: 'late'        },
  missed:      { label: 'Bỏ lỡ',                 cls: 'missed'      },
}

export default function SlotCard({ slot, checkin, dateStr, onToggle, remoteCompany }) {
  const status = getSlotStatus(slot, checkin?.checked_at, dateStr, checkin?.status)
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.future
  
  const isCheckable = dateStr === todayStr() || (dateStr === tomorrowStr() && slot.id === 'sleep' && nowMinutes() >= 23 * 60 + 30)
  
  // Can click/check if active, future, or in_progress (on_time/late done slots cannot be clicked again to prevent reset)
  const canCheck = isCheckable && (status === 'active' || status === 'future' || status === 'in_progress')
  
  // Only completed checkins are considered "checked" (shows checkmark, score, delay text)
  const isChecked = !!checkin?.checked_at && checkin?.status !== 'in_progress'

  let delayText = ''
  if (isChecked && checkin?.checked_at) {
    const delay = getSlotDelay(slot, checkin.checked_at, dateStr)
    if (delay <= BUFFER_MIN) delayText = 'Đúng giờ'
    else delayText = `+${delay} phút`
  }

  const label = slot.id === 'remote'
    ? `${slot.label} ${remoteCompany}`
    : slot.label

  const timeLabel = slot.endH === slot.startH && slot.endM === slot.startM
    ? formatTime(slot.startH, slot.startM)
    : `${formatTime(slot.startH, slot.startM)} – ${slot.endH === 0 && slot.endM === 0 ? '00:00' : formatTime(slot.endH, slot.endM)}`

  // Score for this slot (only calculated and visible when completed or missed)
  const score = getSlotScore(slot, checkin?.checked_at, dateStr, checkin?.status)

  const IconComponent = ICON_MAP[slot.icon] || IconWork

  return (
    <div
      className={`slot-card ${cfg.cls} ${isChecked ? 'checked' : ''} ${status === 'in_progress' ? 'in-progress' : ''}`}
      onClick={() => canCheck && onToggle(slot.id)}
      role={canCheck ? 'button' : undefined}
      tabIndex={canCheck ? 0 : undefined}
    >
      <div className="slot-icon">
        <IconComponent className="slot-icon-svg" />
      </div>
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
        {status === 'in_progress' && <IconLightning className="slot-in-progress-svg" />}
        {isChecked && <IconCheck className="slot-check-svg" />}
      </div>
    </div>
  )
}
