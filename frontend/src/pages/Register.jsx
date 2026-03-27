import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../utils/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await registerUser(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.logoArea}>
          <div style={styles.logo}>⛳</div>
          <h1 style={styles.title}>Join Golf Charity</h1>
          <p style={styles.subtitle}>Create your account and start playing</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.planBox}>
            <p style={styles.planTitle}>Choose your plan</p>
            <div style={styles.planRow}>
              {['monthly', 'yearly'].map(plan => (
                <div
                  key={plan}
                  onClick={() => setForm({ ...form, plan })}
                  style={form.plan === plan ? { ...styles.planCard, ...styles.planCardActive } : styles.planCard}
                >
                  <div style={styles.planName}>{plan === 'monthly' ? '📅 Monthly' : '🗓️ Yearly'}</div>
                  <div style={styles.planPrice}>{plan === 'monthly' ? '$10/mo' : '$99/yr'}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Choose a Charity</label>
            <select
              style={styles.input}
              name="charity_name"
              value={form.charity_name || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select a charity...</option>
              <option value="Red Cross">Red Cross</option>
              <option value="UNICEF">UNICEF</option>
              <option value="WWF">WWF</option>
              <option value="Doctors Without Borders">Doctors Without Borders</option>
              <option value="Save the Children">Save the Children</option>
            </select>
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
  },
  error: {
    background: '#fff0f0',
    border: '1px solid #ffcccc',
    color: '#cc0000',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '12px 14px',
    border: '2px solid #e8e8e8',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
    background: 'white',
  },
  planBox: {
    background: '#f8f8ff',
    borderRadius: '12px',
    padding: '14px',
  },
  planTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    margin: '0 0 10px 0',
  },
  planRow: {
    display: 'flex',
    gap: '10px',
  },
  planCard: {
    flex: 1,
    border: '2px solid #e8e8e8',
    borderRadius: '10px',
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'white',
    transition: 'all 0.2s',
  },
  planCardActive: {
    border: '2px solid #6c63ff',
    background: '#f0eeff',
  },
  planName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
  },
  planPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6c63ff',
  },
  button: {
    background: 'linear-gradient(135deg, #4a4a8a, #6c63ff)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginTop: '24px',
    marginBottom: 0,
  },
  link: {
    color: '#6c63ff',
    textDecoration: 'none',
    fontWeight: '600',
  },
}