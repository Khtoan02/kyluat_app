import { formatDateVi, calcDayScore, SLOTS } from '../lib/slots'

export default function History({ history }) {
  if (!history || history.length === 0) {
    return <p className="empty-hist">Chưa có dữ liệu lịch sử</p>
  }

  return (
    <div className="history">
      <div className="hist-title">7 ngày gần nhất</div>
      {history.map(({ date, checkins }) => {
        const score = calcDayScore(SLOTS, checkins)
        const color = score === 100 ? '#10b981' : score >= 70 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'
        return (
          <div key={date} className="hist-row">
            <span className="hist-date">{formatDateVi(date)}</span>
            <div className="hist-bar">
              <div className="hist-fill" style={{ width: `${score}%`, background: color }} />
            </div>
            <span className="hist-pct" style={{ color }}>{score}%</span>
          </div>
        )
      })}
    </div>
  )
}
