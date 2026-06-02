import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { SLOTS, todayStr, getRemoteCompany, calcDayScore } from './lib/slots'
import { useNotifications } from './lib/useNotifications'
import Auth from './components/Auth'
import SlotCard from './components/SlotCard'
import History from './components/History'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [history, setHistory] = useState([])
  const [viewDate, setViewDate] = useState(todayStr())
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useNotifications(checkins)

  // Tick clock every 30s to update active slot
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchAll(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchAll(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchAll = useCallback(async (userId) => {
    setLoading(true)
    // Fetch last 7 days + today
    const dates = Array.from({ length: 8 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().slice(0, 10)
    })
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .in('date', dates)
    if (data) {
      const today = todayStr()
      setCheckins(data.filter(c => c.date === today))
      // Build history (exclude today)
      const hist = dates.slice(1).map(date => ({
        date,
        checkins: data.filter(c => c.date === date)
      })).filter(h => h.checkins.length > 0)
      setHistory(hist)
    }
    setLoading(false)
  }, [])

  async function handleToggle(slotId) {
    if (!session) return
    const today = todayStr()
    const existing = checkins.find(c => c.slot_id === slotId && c.date === today)

    if (existing?.checked_at) {
      // Uncheck
      await supabase.from('checkins').update({ checked_at: null }).eq('id', existing.id)
      setCheckins(prev => prev.map(c => c.id === existing.id ? { ...c, checked_at: null } : c))
    } else {
      const now = new Date().toISOString()
      if (existing) {
        await supabase.from('checkins').update({ checked_at: now }).eq('id', existing.id)
        setCheckins(prev => prev.map(c => c.id === existing.id ? { ...c, checked_at: now } : c))
      } else {
        const { data } = await supabase.from('checkins').insert({
          user_id: session.user.id,
          date: today,
          slot_id: slotId,
          checked_at: now,
        }).select().single()
        if (data) setCheckins(prev => [...prev, data])
      }
    }
  }

  function changeDay(dir) {
    const d = new Date(viewDate + 'T12:00:00')
    d.setDate(d.getDate() + dir)
    const next = d.toISOString().slice(0, 10)
    if (next <= todayStr()) setViewDate(next)
  }

  if (!session) return <Auth />
  if (loading) return <div className="loading"><div className="loading-text">Đang tải...</div></div>

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
    <div className="app">
      <header className="app-header">
        <div className="app-logo">KỶ LUẬT</div>
        <button className="logout-btn" onClick={() => supabase.auth.signOut()}>Thoát</button>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{streak}</div>
          <div className="stat-lbl">🔥 Streak</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-val">{isToday ? score : calcDayScore(SLOTS, viewCheckins)}%</div>
          <div className="stat-lbl">{isToday ? 'Hôm nay' : 'Ngày này'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{avgScore !== null ? avgScore + '%' : '—'}</div>
          <div className="stat-lbl">Trung bình</div>
        </div>
      </div>

      {isToday && missedToday.length > 0 && (
        <div className="miss-banner">
          ⚠️ Bỏ lỡ: {missedToday.map(s => s.label).join(', ')}
        </div>
      )}

      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${isToday ? score : calcDayScore(SLOTS, viewCheckins)}%` }} />
        </div>
        <span className="progress-label">{isToday ? score : calcDayScore(SLOTS, viewCheckins)}% kỷ luật</span>
      </div>

      <div className="date-nav">
        <button onClick={() => changeDay(-1)}>‹</button>
        <span className="date-label">
          {isToday ? 'Hôm nay' : new Date(viewDate + 'T12:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
          {' · Công ty '}{remoteCompany}
        </span>
        <button onClick={() => changeDay(1)} disabled={isToday}>›</button>
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

      <div className="clock-footer">
        {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

function calcStreak(history) {
  let streak = 0
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
  for (const { date, checkins } of sorted) {
    if (calcDayScore(SLOTS, checkins) === 100) streak++
    else break
  }
  return streak
}

function getSlotStatusFromLib(slot, checkedAt, dateStr) {
  const { getSlotStatus } = require('./lib/slots')
  return getSlotStatus(slot, checkedAt, dateStr)
}
