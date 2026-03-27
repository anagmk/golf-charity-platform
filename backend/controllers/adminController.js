const supabase = require('../supabase')

const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, role')
      .eq('role', 'user')  // ← add this line
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ users: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getAllSubscriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, users!inner(name, email, role)')
      .eq('users.role', 'user')  // ← add this line
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ subscriptions: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getAllDraws = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*, draw_entries(user_id, matched)')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ draws: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getStats = async (req, res) => {
  try {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: totalSubs } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: totalDraws } = await supabase
      .from('draws')
      .select('*', { count: 'exact', head: true })

    res.json({
      stats: {
        total_users: totalUsers,
        active_subscriptions: totalSubs,
        total_draws: totalDraws
      }
    })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

module.exports = { getAllUsers, getAllSubscriptions, getAllDraws, getStats }