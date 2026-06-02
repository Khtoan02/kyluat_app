import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { IconSparkle, IconMail, IconLock } from './Icons'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    setIsSuccess(false)
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setMsg(error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không chính xác!' : error.message)
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
          setMsg(error.message)
        } else {
          setIsSuccess(true)
          setMsg('Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản. 🎉')
          setEmail('')
          setPassword('')
        }
      }
    } catch (err) {
      setMsg('Đã xảy ra lỗi kết nối, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      {/* Decorative blobs for the Auth screen */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>
      
      <div className="auth-card">
        <div className="auth-branding">
          <IconSparkle className="logo-icon-svg" />
          <h1 className="auth-logo">KỶ LUẬT</h1>
        </div>
        <p className="auth-sub">Đồng bộ đám mây và rèn luyện thói quen kỷ luật mỗi ngày</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <IconMail className="input-icon-svg" />
            <input
              type="email"
              placeholder="Địa chỉ Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <IconLock className="input-icon-svg" />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span className="btn-spinner"></span>
            ) : isLogin ? (
              'ĐĂNG NHẬP NGAY'
            ) : (
              'ĐĂNG KÝ TÀI KHOẢN'
            )}
          </button>
        </form>
        
        {msg && (
          <p className={`auth-msg ${isSuccess ? 'success' : 'error'}`}>
            {msg}
          </p>
        )}
        
        <button 
          className="auth-toggle" 
          onClick={() => {
            setIsLogin(!isLogin)
            setMsg('')
            setIsSuccess(false)
          }}
          disabled={loading}
        >
          {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Quay lại đăng nhập'}
        </button>
      </div>
    </div>
  )
}
