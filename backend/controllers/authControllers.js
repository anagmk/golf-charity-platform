const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../supabase')

const register = async (req, res) => {
  const { name, email, password, plan, charity_name } = req.body

  if (req.body.role === 'admin') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Cannot register as admin.' }
    })
  }

  if (!email || !password || !name) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: 'Name, email and password are required.' }
    })
  }

  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return res.status(409).json({
        error: { code: 'EMAIL_EXISTS', message: 'Email already registered.' }
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name }])
      .select()
      .single()

    if (error) throw error

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })

    if (plan && charity_name) {
      await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          plan,
          charity_name,
          charity_percent: 10,
          status: 'active'
        }])
    }

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: 'Email and password are required.' }
    })
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })

    console.log('User found:', user) // ← add this
    console.log('DB error:', error) 

  } catch (err) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message }
    })
  }
}

module.exports = { register, login }