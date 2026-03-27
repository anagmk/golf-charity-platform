const supabase = require('../supabase')

const runDraw = async (req, res) => {
  try {
    // generate 5 random numbers between 1-45
    const draw_numbers = []
    while (draw_numbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1
      if (!draw_numbers.includes(num)) {
        draw_numbers.push(num)
      }
    }

    // save draw
    const { data: draw, error } = await supabase
      .from('draws')
      .insert([{ draw_numbers, status: 'published' }])
      .select()
      .single()

    if (error) throw error

    // get all users with scores
    const { data: allScores } = await supabase
      .from('scores')
      .select('user_id, score')

    // group scores by user
    const userScores = {}
    allScores.forEach(s => {
      if (!userScores[s.user_id]) userScores[s.user_id] = []
      userScores[s.user_id].push(s.score)
    })

    // check matches for each user
    const entries = []
    for (const [user_id, scores] of Object.entries(userScores)) {
      const matched = scores.filter(s => draw_numbers.includes(s)).length
      entries.push({ draw_id: draw.id, user_id, matched })
    }

    if (entries.length > 0) {
      await supabase.from('draw_entries').insert(entries)
    }

    res.status(201).json({
      message: 'Draw completed!',
      draw_numbers,
      draw_id: draw.id,
      total_participants: entries.length,
      winners: {
        five_match: entries.filter(e => e.matched === 5).length,
        four_match: entries.filter(e => e.matched === 4).length,
        three_match: entries.filter(e => e.matched === 3).length,
      }
    })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getDrawResults = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    res.json({ draws: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const getMyResults = async (req, res) => {
  const user_id = req.user.id

  try {
    const { data, error } = await supabase
      .from('draw_entries')
      .select('*, draws(*)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ results: data })

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

module.exports = { runDraw, getDrawResults, getMyResults }