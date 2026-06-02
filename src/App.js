import { useState, useEffect, useCallback } from 'react'
import { SLOTS, todayStr, getRemoteCompany, calcDayScore, getSlotStatus, formatDateVi } from './lib/slots'
import { useNotifications } from './lib/useNotifications'
import SlotCard from './components/SlotCard'
import './App.css'

export default function App() {
  const [checkins, setCheckins] = useState([])
  const [history, setHistory] = useState([])
  const [viewDate, setViewDate] = useState(todayStr())
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const [showDataPanel, setShowDataPanel] = useState(false)
  
  // Navigation tabs on mobile ('checkin' | 'analytics')
  const [activeTab, setActiveTab] = useState('checkin')

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
  
  // Calculate Average score across all days in history + today
  const allDaysForAverage = [
    { date: today, checkins },
    ...history
  ].filter(d => d.checkins.length > 0)
  
  const avgScore = allDaysForAverage.length > 0
    ? Math.round(allDaysForAverage.reduce((s, d) => s + calcDayScore(SLOTS, d.checkins), 0) / allDaysForAverage.length)
    : null

  const missedToday = SLOTS.filter(slot => {
    const ci = checkins.find(c => c.slot_id === slot.id)
    return getSlotStatusFromLib(slot, ci?.checked_at, today) === 'missed'
  })

  // 1. COMPUTING ADVANCED COMPLIANCE STATISTICS FOR SLOTS
  // We scan the history to find how consistent we are with each slot.
  const totalDaysInHistory = history.length + 1 // including today
  const slotComplianceStats = SLOTS.map(slot => {
    let completedCount = 0
    let onTimeCount = 0
    let lateCount = 0
    let missedCount = 0

    // Include today + history
    const allRecordedDays = [{ date: today, checkins }, ...history]
    
    allRecordedDays.forEach(day => {
      const ci = day.checkins.find(c => c.slot_id === slot.id)
      if (ci?.checked_at) {
        completedCount++
        const status = getSlotStatus(slot, ci.checked_at, day.date)
        if (status === 'on_time') onTimeCount++
        else if (status === 'late') lateCount++
      } else {
        // If the day is fully recorded or it's today and the time has passed, it's missed
        const status = getSlotStatus(slot, null, day.date)
        if (status === 'missed') missedCount++
      }
    })

    const completionRate = totalDaysInHistory > 0 ? Math.round((completedCount / totalDaysInHistory) * 100) : 0

    return {
      id: slot.id,
      label: slot.label,
      icon: slot.icon,
      completionRate,
      onTimeCount,
      lateCount,
      missedCount,
      completedCount,
    }
  })

  // Filter slots into Best Habits (>= 70%) and Needs Improvement (< 70%)
  // If no history, everything is empty.
  const bestHabits = slotComplianceStats.filter(s => s.completedCount > 0 && s.completionRate >= 70).sort((a, b) => b.completionRate - a.completionRate)
  const badHabits = slotComplianceStats.filter(s => s.completedCount === 0 || s.completionRate < 70).sort((a, b) => a.completionRate - b.completionRate)

  // 2. GENERATING CHART DATA
  // We prepare chronological 7 days of percentages (including today)
  const chartDays = [
    { date: today, checkins },
    ...history
  ].slice(0, 7).reverse() // Show up to 7 days, oldest to newest

  return (
    <div className="app-container">
      {/* Decorative background glow blobs */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      <div className="app-layout-wrapper">
        
        {/* LEFT COLUMN / MOBILE VIEW: MAIN TIMELINE */}
        <div className={`app-card column-timeline ${activeTab === 'checkin' ? 'active-mobile' : 'inactive-mobile'}`}>
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

          <footer className="clock-footer">
            <div className="live-badge">● LIVE</div>
            <div className="time-display">
              {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </footer>
        </div>

        {/* RIGHT COLUMN / MOBILE VIEW: DETAILED ANALYTICS */}
        <div className={`app-card column-analytics ${activeTab === 'analytics' ? 'active-mobile' : 'inactive-mobile'}`}>
          <header className="analytics-header">
            <h2 className="section-title">📊 PHÂN TÍCH TIẾN TRÌNH</h2>
            <p className="section-subtitle">Thống kê hiệu quả rèn luyện thói quen</p>
          </header>

          {/* SVG COLUMN CHART */}
          <div className="chart-container">
            <h3 className="card-subtitle">Hiệu suất 7 ngày qua</h3>
            
            {chartDays.length === 0 ? (
              <p className="no-data-text">Chưa có dữ liệu biểu đồ. Hãy hoàn thành các mục hôm nay!</p>
            ) : (
              <div className="svg-wrapper">
                <svg viewBox="0 0 340 180" className="discipline-svg-chart">
                  {/* Grid lines */}
                  <line x1="30" y1="20" x2="330" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                  <line x1="30" y1="80" x2="330" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                  <line x1="30" y1="140" x2="330" y2="140" stroke="rgba(255,255,255,0.05)" />
                  
                  {/* Left axes labels */}
                  <text x="22" y="24" fill="#64748b" fontSize="8" textAnchor="end">100%</text>
                  <text x="22" y="84" fill="#64748b" fontSize="8" textAnchor="end">50%</text>
                  <text x="22" y="144" fill="#64748b" fontSize="8" textAnchor="end">0%</text>

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>

                  {/* Columns */}
                  {chartDays.map((d, index) => {
                    const dayScore = calcDayScore(SLOTS, d.checkins)
                    const isCurrent = d.date === today
                    
                    // x positioning: starts at 40, spaced by 42px
                    const x = 40 + index * 42
                    // Height calculation: max height is 120px (from y=20 to y=140)
                    const height = Math.max(4, Math.round((dayScore / 100) * 120))
                    const y = 140 - height

                    return (
                      <g key={d.date} className="chart-bar-group">
                        {/* Interactive glow backing */}
                        {dayScore > 0 && (
                          <rect 
                            x={x} 
                            y={y} 
                            width="20" 
                            height={height} 
                            rx="5" 
                            fill={isCurrent ? "url(#todayGradient)" : "url(#barGradient)"} 
                            opacity="0.15" 
                            filter="blur(4px)"
                          />
                        )}
                        {/* Core column rect */}
                        <rect 
                          x={x} 
                          y={y} 
                          width="20" 
                          height={height} 
                          rx="5" 
                          fill={isCurrent ? "url(#todayGradient)" : "url(#barGradient)"}
                          className="chart-rect"
                        />
                        {/* Score Text above column */}
                        <text 
                          x={x + 10} 
                          y={y - 6} 
                          fill={isCurrent ? "#a5b4fc" : "#cbd5e1"} 
                          fontSize="9" 
                          fontWeight="700" 
                          textAnchor="middle"
                        >
                          {dayScore}%
                        </text>
                        {/* Day label */}
                        <text 
                          x={x + 10} 
                          y="158" 
                          fill={isCurrent ? "#a5b4fc" : "#64748b"} 
                          fontSize="8" 
                          fontWeight={isCurrent ? "800" : "500"} 
                          textAnchor="middle"
                        >
                          {isCurrent ? "H.Nay" : formatDateVi(d.date).split(' ')[0]}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* HABIT QUALITY CLASSIFICATION */}
          <div className="habit-intelligence">
            
            {/* BEST HABITS PANEL */}
            <div className="habit-card best">
              <h3 className="card-subtitle success">🏆 Kỷ luật tốt nhất (≥ 70%)</h3>
              {bestHabits.length === 0 ? (
                <p className="no-data-text mini">Thực hiện kỷ luật đúng giờ liên tục để xếp hạng tại đây.</p>
              ) : (
                <div className="habit-list">
                  {bestHabits.map(habit => (
                    <div key={habit.id} className="habit-item">
                      <span className="habit-icon-wrap">{habit.icon}</span>
                      <div className="habit-detail">
                        <div className="habit-name">{habit.label}</div>
                        <div className="habit-stats">
                          Đúng giờ: {habit.onTimeCount}L {habit.lateCount > 0 && `· Trễ: ${habit.lateCount}L`}
                        </div>
                      </div>
                      <div className="habit-rate success">{habit.completionRate}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NEEDS IMPROVEMENT PANEL */}
            <div className="habit-card improve">
              <h3 className="card-subtitle warning">⚠️ Cần cải thiện (&lt; 70%)</h3>
              {badHabits.length === 0 ? (
                <p className="no-data-text mini">Quá xuất sắc! Bạn không có thói quen nào cần cải thiện.</p>
              ) : (
                <div className="habit-list">
                  {badHabits.map(habit => (
                    <div key={habit.id} className="habit-item">
                      <span className="habit-icon-wrap">{habit.icon}</span>
                      <div className="habit-detail">
                        <div className="habit-name">{habit.label}</div>
                        <div className="habit-stats">
                          {habit.completedCount > 0 
                            ? `Đã làm: ${habit.completedCount}L · Bỏ lỡ: ${habit.missedCount}L`
                            : 'Chưa từng check-in trong tuần này'
                          }
                        </div>
                      </div>
                      <div className="habit-rate warning">{habit.completionRate}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav className="mobile-nav-bar">
        <button 
          className={`mobile-nav-item ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          <span className="nav-icon">🎯</span>
          <span className="nav-text">Nhiệm vụ</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Phân tích</span>
        </button>
      </nav>
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
