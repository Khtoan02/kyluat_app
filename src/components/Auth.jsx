import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMsg(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setMsg(error.message)
        else setMsg('Kiểm tra email để xác nhận tài khoản!')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">KỶ LUẬT</div>
        <p className="auth-sub">Theo dõi kỷ luật cá nhân hằng ngày</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
        {msg && <p className="auth-msg">{msg}</p>}
        <button className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </div>
    </div>
  )
}
