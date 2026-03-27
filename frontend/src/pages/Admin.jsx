import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminStats,
  getAdminUsers,
  getAdminSubscriptions,
  getAdminDraws,
  runDraw
} from '../utils/api'

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [draws, setDraws] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s, u, sub, d] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminSubscriptions(),
        getAdminDraws()
      ])
      setStats(s.data.stats)
      setUsers(u.data.users)
      setSubscriptions(sub.data.subscriptions)
      setDraws(d.data.draws)
    } catch (err) {
      console.log(err)
    }
  }

  const handleRunDraw = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await runDraw()
      setMessage(`Draw completed! Numbers: ${res.data.draw_numbers.join(', ')}`)
      fetchAll()
    } catch (err) {
      setMessage('Failed to run draw')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminKey')
    navigate('/admin-login')
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>⛳ Golf Charity</span>
          <span style={styles.adminBadge}>ADMIN</span>
        </div>
        <div style={styles.navRight}>
          
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['stats', 'users', 'subscriptions', 'draws'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          >
            {tab === 'stats' && '📊 Stats'}
            {tab === 'users' && '👥 Users'}
            {tab === 'subscriptions' && '💳 Subscriptions'}
            {tab === 'draws' && '🎰 Draws'}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div>
            <h2 style={styles.sectionTitle}>Platform Overview</h2>
            {stats && (
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>👥</div>
                  <div style={styles.statValue}>{stats.total_users}</div>
                  <div style={styles.statLabel}>Total Users</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>💳</div>
                  <div style={styles.statValue}>{stats.active_subscriptions}</div>
                  <div style={styles.statLabel}>Active Subscriptions</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🎰</div>
                  <div style={styles.statValue}>{stats.total_draws}</div>
                  <div style={styles.statLabel}>Total Draws</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>💰</div>
                  <div style={styles.statValue}>
                    ${(stats.active_subscriptions * 10).toFixed(0)}
                  </div>
                  <div style={styles.statLabel}>Monthly Pool</div>
                </div>
              </div>
            )}

            {/* Run Draw */}
            <div style={styles.drawBox}>
              <h3 style={styles.cardTitle}>🎰 Run Monthly Draw</h3>
              <p style={styles.drawDesc}>
                This will generate 5 random numbers and check all users scores for matches.
              </p>
              {message && <div style={styles.success}>{message}</div>}
              <button
                onClick={handleRunDraw}
                style={loading ? { ...styles.drawBtn, opacity: 0.7 } : styles.drawBtn}
                disabled={loading}
              >
                {loading ? 'Running Draw...' : '🎰 Run Draw Now'}
              </button>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2 style={styles.sectionTitle}>All Users ({users.length})</h2>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div>
            <h2 style={styles.sectionTitle}>
              All Subscriptions ({subscriptions.length})
            </h2>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Plan</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Charity</th>
                    <th style={styles.th}>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s, i) => (
                    <tr key={s.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{s.users?.name || '—'}</td>
                      <td style={styles.td}>{s.plan}</td>
                      <td style={styles.td}>
                        <span style={s.status === 'active' ? styles.badgeGreen : styles.badgeRed}>
                          {s.status}
                        </span>
                      </td>
                      <td style={styles.td}>{s.charity_name}</td>
                      <td style={styles.td}>{s.charity_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRAWS TAB */}
        {activeTab === 'draws' && (
          <div>
            <h2 style={styles.sectionTitle}>All Draws ({draws.length})</h2>
            {draws.map(draw => (
              <div key={draw.id} style={styles.drawCard}>
                <div style={styles.drawHeader}>
                  <span style={styles.drawDate}>
                    {new Date(draw.created_at).toLocaleDateString()}
                  </span>
                  <span style={styles.badgeGreen}>{draw.status}</span>
                </div>
                <div style={styles.drawNumbers}>
                  {draw.draw_numbers.map((n, i) => (
                    <span key={i} style={styles.drawBall}>{n}</span>
                  ))}
                </div>
                <div style={styles.drawStats}>
                  <span>Total entries: <strong>{draw.draw_entries?.length || 0}</strong></span>
                  <span>
                    Winners (3+ match):{' '}
                    <strong>
                      {draw.draw_entries?.filter(e => e.matched >= 3).length || 0}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f4f6ff',
    fontFamily: "'Segoe UI', sans-serif",
  },
  navbar: {
    background: 'linear-gradient(135deg, #1a1a2e, #4a4a8a)',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: { color: 'white', fontSize: '20px', fontWeight: '700' },
  adminBadge: {
    background: '#ff6b6b',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  navRight: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  logoutBtn: {
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  tabs: {
    background: 'white',
    display: 'flex',
    padding: '0 32px',
    borderBottom: '1px solid #eee',
    gap: '4px',
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: '16px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#888',
    fontWeight: '500',
    borderBottom: '3px solid transparent',
  },
  tabActive: {
    color: '#6c63ff',
    borderBottom: '3px solid #6c63ff',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statIcon: { fontSize: '32px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: '13px', color: '#888', marginTop: '4px' },
  drawBox: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 0,
    marginBottom: '8px',
  },
  drawDesc: { fontSize: '14px', color: '#888', marginBottom: '16px' },
  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  drawBtn: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: 'linear-gradient(135deg, #1a1a2e, #4a4a8a)' },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
  },
  td: { padding: '12px 16px', fontSize: '14px', color: '#444' },
  trEven: { background: '#f9f9ff' },
  trOdd: { background: 'white' },
  badgeGreen: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeRed: {
    background: '#ffebee',
    color: '#c62828',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  drawCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  drawHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  drawDate: { fontSize: '14px', color: '#888' },
  drawNumbers: { display: 'flex', gap: '10px', marginBottom: '16px' },
  drawBall: {
    background: 'linear-gradient(135deg, #4a4a8a, #6c63ff)',
    color: 'white',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
  },
  drawStats: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    color: '#555',
  },
}