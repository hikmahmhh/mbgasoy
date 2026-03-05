import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'testing@email.com',
    password: 'Test1234',
    phone: '081234567890',
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name: 'Test User' }
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ user: data.user }), { status: 200 })
})
