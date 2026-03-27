import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getScores,
  addScore,
  getSubscription,
  getDrawResults,
  getMyResults
} from '../utils/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [scores, setScores] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [drawResults, setDrawResults] = useState([])
  const [myResults, setMyResults] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [scoreForm, setScoreForm] = useState({ score: '', date: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s, sub, dr, mr] = await Promise.all([
        getScores(),
        getSubscription(),
        getDrawResults(),
        getMyResults()
      ])
      setScores(s.data.scores)
      setSubscription(sub.data.subscription)
      setDrawResults(dr.data.draws)
      setMyResults(mr.data.results)
    } catch (err) {
      console.log(err)
    }
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await addScore({
        score: parseInt(scoreForm.score),
        date: scoreForm.date
      })
      setMessage('Score added successfully!')
      setScoreForm({ score: '', date: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add score')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>⛳ Golf Charity</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'scores', 'draws', 'charity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'scores' && '🏌️ Scores'}
            {tab === 'draws' && '🎰 Draws'}
            {tab === 'charity' && '❤️ Charity'}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={styles.sectionTitle}>Welcome back, {user.name}! 👋</h2>
            <div style={styles.statsGrid}>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏌️</div>
                <div style={styles.statValue}>{scores.length}</div>
                <div style={styles.statLabel}>Scores Entered</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>📋</div>
                <div style={styles.statValue}>{subscription?.plan || 'None'}</div>
                <div style={styles.statLabel}>Current Plan</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🎰</div>
                <div style={styles.statValue}>{myResults.length}</div>
                <div style={styles.statLabel}>Draws Entered</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>❤️</div>
                <div style={styles.statValue}>{subscription?.charity_percent || 0}%</div>
                <div style={styles.statLabel}>Charity %</div>
              </div>

            </div>

            {/* Subscription status */}
            {subscription && (
              <div style={styles.subCard}>
                <div style={styles.subHeader}>
                  <span style={styles.subTitle}>Your Subscription</span>
                  <span style={subscription.status === 'active' ? styles.badgeGreen : styles.badgeRed}>
                    {subscription.status}
                  </span>
                </div>
                <div style={styles.subDetails}>
                  <span>Plan: <strong>{subscription.plan}</strong></span>
                  <span>Charity: <strong>{subscription.charity_name}</strong></span>
                  <span>Contribution: <strong>{subscription.charity_percent}%</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCORES TAB */}
        {activeTab === 'scores' && (
          <div>
            <h2 style={styles.sectionTitle}>🏌️ My Golf Scores</h2>

            <div style={styles.scoreFormCard}>
              <h3 style={styles.cardTitle}>Add New Score</h3>
              {message && <div style={styles.success}>{message}</div>}
              {error && <div style={styles.error}>{error}</div>}
              <form onSubmit={handleAddScore} style={styles.scoreForm}>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Score (1-45)"
                  min="1"
                  max="45"
                  value={scoreForm.score}
                  onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })}
                  required
                />
                <input
                  style={styles.input}
                  type="date"
                  value={scoreForm.date}
                  onChange={e => setScoreForm({ ...scoreForm, date: e.target.value })}
                  required
                />
                <button type="submit" style={styles.button}>Add Score</button>
              </form>
              <p style={styles.hint}>Only your latest 5 scores are kept</p>
            </div>

            <div style={styles.scoresList}>
              {scores.length === 0 ? (
                <div style={styles.empty}>No scores yet. Add your first score!</div>
              ) : (
                scores.map((s, i) => (
                  <div key={s.id} style={styles.scoreItem}>
                    <div style={styles.scoreRank}>#{i + 1}</div>
                    <div style={styles.scoreValue}>{s.score} pts</div>
                    <div style={styles.scoreDate}>{new Date(s.date).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DRAWS TAB */}
        {activeTab === 'draws' && (
          <div>
            <h2 style={styles.sectionTitle}>🎰 Draw Results</h2>

            {drawResults.length === 0 ? (
              <div style={styles.empty}>No draws have been run yet.</div>
            ) : (
              drawResults.map(draw => {
                const myEntry = myResults.find(r => r.draw_id === draw.id)
                return (
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
                    {myEntry && (
                      <div style={styles.myMatch}>
                        Your matches: <strong>{myEntry.matched}</strong>
                        {myEntry.matched >= 3 && ' 🏆 Winner!'}
                        {myEntry.matched === 2 && ' 👏 Close!'}
                        {myEntry.matched < 2 && ' — Better luck next time!'}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* CHARITY TAB */}
        {activeTab === 'charity' && (
          <div>
            <h2 style={styles.sectionTitle}>❤️ Your Charity Impact</h2>
            {subscription ? (
              <div style={styles.charityCard}>
                <div style={styles.charityIcon}>🌍</div>
                <h3 style={styles.charityName}>{subscription.charity_name}</h3>
                <p style={styles.charityText}>
                  You are donating <strong>{subscription.charity_percent}%</strong> of your
                  subscription to {subscription.charity_name} every month.
                </p>
                <div style={styles.charityBadge}>
                  {subscription.plan === 'monthly'
                    ? `$${(10 * subscription.charity_percent / 100).toFixed(2)} / month`
                    : `$${(99 * subscription.charity_percent / 100).toFixed(2)} / year`
                  }
                </div>
                <p style={styles.charitySubtext}>Thank you for making a difference! 💚</p>
              </div>
            ) : (
              <div style={styles.empty}>No subscription found.</div>
            )}
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
  navLeft: { display: 'flex', alignItems: 'center' },
  navLogo: { color: 'white', fontSize: '20px', fontWeight: '700' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { color: 'rgba(255,255,255,0.85)', fontSize: '14px' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
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
    maxWidth: '900px',
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
  statValue: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: '13px', color: '#888', marginTop: '4px' },
  subCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  subHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  subTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  subDetails: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    color: '#555',
    flexWrap: 'wrap',
  },
  badgeGreen: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeRed: {
    background: '#ffebee',
    color: '#c62828',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  scoreFormCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '16px',
    marginTop: 0,
  },
  scoreForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px 14px',
    border: '2px solid #e8e8e8',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
  },
  button: {
    background: 'linear-gradient(135deg, #4a4a8a, #6c63ff)',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  hint: { fontSize: '12px', color: '#aaa', marginTop: '8px', marginBottom: 0 },
  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
  },
  error: {
    background: '#fff0f0',
    color: '#cc0000',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '12px',
  },
  scoresList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  scoreItem: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  scoreRank: { fontSize: '13px', color: '#aaa', width: '30px' },
  scoreValue: { fontSize: '20px', fontWeight: '700', color: '#6c63ff' },
  scoreDate: { fontSize: '13px', color: '#888' },
  empty: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    color: '#aaa',
    fontSize: '15px',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
  },
  myMatch: {
    background: '#f8f8ff',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#444',
  },
  charityCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  charityIcon: { fontSize: '64px', marginBottom: '16px' },
  charityName: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  charityText: { fontSize: '15px', color: '#555', marginBottom: '20px', lineHeight: '1.6' },
  charityBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #4a4a8a, #6c63ff)',
    color: 'white',
    padding: '12px 28px',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  charitySubtext: { fontSize: '14px', color: '#888' },
}
