const supabase = require('../supabase')

const addScore = async (req, res) => {
  const { score, date } = req.body
  const user_id = req.user.id

  if (!score || !date) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: 'Score and date are required.' }
    })
  }

  if (score < 1 || score > 45) {
    return res.status(400).json({
      error: { code: 'INVALID_SCORE', message: 'Score must be between 1 and 45.' }
    })
  }

  try {
    // get current scores for this user
    const { data: existing } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })

    // if already 5 scores, delete the oldest one
    if (existing && existing.length >= 5) {
      await supabase
        .from('scores')
        .delete()
        .eq('id', existing[0].id)
    }

    // insert new score
    const { data, error } = await supabase
      .from('scores')
      .insert([{ user_id, score, date }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'Score added successfully!',
      score: data
    })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getScores = async (req, res) => {
  const user_id = req.user.id

  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })

    if (error) throw error

    res.json({ scores: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

module.exports = { addScore, getScores }