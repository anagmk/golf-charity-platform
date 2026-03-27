const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: __dirname + '/.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

module.exports = supabase