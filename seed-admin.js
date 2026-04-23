const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedAdmin() {
  console.log('Signing up admin...')
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@gmail.com',
    password: 'password',
    options: {
      data: {
        role: 'admin'
      }
    }
  })

  if (error) {
    console.error('Error signing up:', error.message)
    return
  }

  console.log('User created:', data.user?.id)
}

seedAdmin()
