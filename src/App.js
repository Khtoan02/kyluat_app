import { useState, useEffect, useCallback } from 'react'
import { SLOTS, todayStr, getRemoteCompany, calcDayScore } from './lib/slots'
import { useNotifications } from './lib/useNotifications'
import SlotCard from './components/SlotCard'
import History from './components/History'
import './App.css'

export default function App() {
  const [checkins, setCheckins] = useState([])
  const [history, setHistory] = useState([])
  const [viewDate, setViewDate] = useState(todayStr())
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const [showDataPanel, setShowDataPanel] = useState(false)

  useNotifications(checkins)

  // Tick clock every 30s to update active slot
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Local storage fetcher
  const fetchAllLocal = useCallback(() => {
    setLoading(true)
    try {
      const saved = localStorage.getItem('discipline_checkins')
      const allCheckins = saved ? JSON.parse(saved) : []

      const today = todayStr()
      setCheckins(allCheckins.filter(c => c.date === today))

      // Build history (last 7 days, excluding today)
      const dates = Array.from({ length: 8 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().slice(0, 10)
      })

      const hist = dates.slice(1).map(date => ({
        date,
        checkins: allCheckins.filter(c => c.date === date)
      })).filter(h => h.checkins.length > 0)

      setHistory(hist)
    } catch (e) {
      console.error('Failed to load checkins from localStorage:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchAllLocal()
  }, [fetchAllLocal])

  // Handle slot toggle
  function handleToggle(slotId) {
    const today = todayStr()
    try {
      const saved = localStorage.getItem('discipline_checkins')
      let allCheckins = saved ? JSON.parse(saved) : []

      const existingIndex = allCheckins.findIndex(c => c.slot_id === slotId && c.date === today)

      if (existingIndex >= 0) {
        const existing = allCheckins[existingIndex]
        if (existing.checked_at) {
          // Uncheck: set checked_at to null
          allCheckins[existingIndex].checked_at = null
        } else {
          // Check: set checked_at to now
          allCheckins[existingIndex].checked_at = new Date().toISOString()
        }
      } else {
        // Create new checkin entry
        allCheckins.push({
          id: Math.random().toString(36).substr(2, 9),
          date: today,
          slot_id: slotId,
          checked_at: new Date().toISOString(),
        })
      }

      localStorage.setItem('discipline_checkins', JSON.stringify(allCheckins))
      fetchAllLocal()
    } catch (e) {
      console.error('Failed to save checkin:', e)
    }
  }

  // Change day in date nav
  function changeDay(dir) {
    const d = new Date(viewDate + 'T12:00:00')
    d.setDate(d.getDate() + dir)
    const next = d.toISOString().slice(0, 10)
    if (next <= todayStr()) setViewDate(next)
  }

  // Export checkins to a JSON file
  function handleExport() {
    const saved = localStorage.getItem('discipline_checkins')
    const dataStr = saved || '[]'
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `ky-luat-data-${todayStr()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import checkins from a JSON file
  function handleImport(e) {
    const fileReader = new FileReader()
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8')
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result)
          if (Array.isArray(parsed)) {
            localStorage.setItem('discipline_checkins', JSON.stringify(parsed))
            fetchAllLocal()
            setShowDataPanel(false)
            alert('Nhập dữ liệu thành công! 🎉')
          } else {
            alert('Định dạng tệp không đúng. Phải là một mảng JSON!')
          }
        } catch (err) {
          alert('Lỗi đọc tệp hoặc tệp không đúng định dạng JSON!')
        }
      }
    }
  }

  // Clear all data (reset app)
  function handleReset() {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu kỷ luật không? Hành động này không thể hoàn tác!')) {
      localStorage.removeItem('discipline_checkins')
      fetchAllLocal()
      setShowDataPanel(false)
      alert('Đã xóa toàn bộ dữ liệu! 🔄')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải dữ liệu...</div>
      </div>
    )
  }

  const today = todayStr()
  const isToday = viewDate === today
  const remoteCompany = getRemoteCompany(viewDate)
  const viewCheckins = isToday ? checkins : history.find(h => h.date === viewDate)?.checkins || []
  const score = calcDayScore(SLOTS, viewCheckins)
  const streak = calcStreak(history)
  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + calcDayScore(SLOTS, h.checkins), 0) / history.length)
    : null

  const missedToday = SLOTS.filter(slot => {
    const ci = checkins.find(c => c.slot_id === slot.id)
    return getSlotStatusFromLib(slot, ci?.checked_at, today) === 'missed'
  })

  return (
    <div className="app-container">
      {/* Decorative background glow blobs */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="app-card">
        <header className="app-header">
          <div className="app-branding">
            <span className="logo-icon">✨</span>
            <div className="app-logo">KỶ LUẬT</div>
          </div>
          <button 
            className={`data-panel-btn ${showDataPanel ? 'active' : ''}`} 
            onClick={() => setShowDataPanel(!showDataPanel)}
            title="Quản lý dữ liệu"
          >
            💾 Dữ liệu
          </button>
        </header>

        {showDataPanel && (
          <div className="data-panel">
            <h3>Quản lý dữ liệu cá nhân</h3>
            <p>Dữ liệu được lưu trữ trực tiếp trên trình duyệt của bạn (100% riêng tư).</p>
            
            <div className="data-actions">
              <button className="btn-action export" onClick={handleExport}>
                📤 Xuất file (Backup)
              </button>
              
              <label className="btn-action import">
                📥 Nhập file (Restore)
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>

              <button className="btn-action reset" onClick={handleReset}>
                ⚠️ Xóa hết dữ liệu
              </button>
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-val-wrapper">
              <span className="stat-val">{streak}</span>
              <span className="stat-emoji">🔥</span>
            </div>
            <div className="stat-lbl">Chuỗi kỷ luật</div>
          </div>
          
          <div className="stat-card highlight">
            <div className="stat-val-wrapper">
              <span className="stat-val">{score}%</span>
              <span className="stat-emoji">🎯</span>
            </div>
            <div className="stat-lbl">{isToday ? 'Hôm nay' : 'Ngày này'}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-val-wrapper">
              <span className="stat-val">{avgScore !== null ? avgScore + '%' : '—'}</span>
              <span className="stat-emoji">📊</span>
            </div>
            <div className="stat-lbl">Trung bình</div>
          </div>
        </div>

        {isToday && missedToday.length > 0 && (
          <div className="miss-banner">
            <span className="banner-icon">⚠️</span>
            <div className="banner-content">
              <strong>Bỏ lỡ:</strong> {missedToday.map(s => s.label).join(', ')}
            </div>
          </div>
        )}

        <div className="progress-wrap">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${score}%` }} 
              />
            </div>
          </div>
          <span className="progress-label">{score}% Hoàn thành</span>
        </div>

        <div className="date-nav">
          <button className="nav-arrow" onClick={() => changeDay(-1)}>‹</button>
          <span className="date-label">
            {isToday ? 'Hôm nay' : new Date(viewDate + 'T12:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
            {' · '}<span className="company-tag">{remoteCompany}</span>
          </span>
          <button className="nav-arrow" onClick={() => changeDay(1)} disabled={isToday}>›</button>
        </div>

        <div className="slots-list">
          {SLOTS.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              checkin={viewCheckins.find(c => c.slot_id === slot.id)}
              dateStr={viewDate}
              onToggle={handleToggle}
              remoteCompany={remoteCompany}
            />
          ))}
        </div>

        <History history={history} />

        <footer className="clock-footer">
          <div className="live-badge">● LIVE</div>
          <div className="time-display">
            {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </footer>
      </div>
    </div>
  )
}

function calcStreak(history) {
  let streak = 0
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
  for (const { checkins } of sorted) {
    if (calcDayScore(SLOTS, checkins) === 100) streak++
    else break
  }
  return streak
}

function getSlotStatusFromLib(slot, checkedAt, dateStr) {
  const { getSlotStatus } = require('./lib/slots')
  return getSlotStatus(slot, checkedAt, dateStr)
}
