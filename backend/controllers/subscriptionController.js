const supabase = require('../supabase')

const createSubscription = async (req, res) => {
  const { plan, charity_name, charity_percent } = req.body
  const user_id = req.user.id

  if (!plan || !charity_name) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: 'Plan and charity name are required.' }
    })
  }

  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({
      error: { code: 'INVALID_PLAN', message: 'Plan must be monthly or yearly.' }
    })
  }

  try {
    // check if subscription already exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return res.status(409).json({
        error: { code: 'ALREADY_SUBSCRIBED', message: 'User already has a subscription.' }
      })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id,
        plan,
        charity_name,
        charity_percent: charity_percent || 10,
        status: 'active'
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'Subscription created successfully!',
      subscription: data
    })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getSubscription = async (req, res) => {
  const user_id = req.user.id

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error || !data) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'No subscription found.' }
      })
    }

    res.json({ subscription: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const cancelSubscription = async (req, res) => {
  const user_id = req.user.id

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) throw error

    res.json({
      message: 'Subscription cancelled.',
      subscription: data
    })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

module.exports = { createSubscription, getSubscription, cancelSubscription }