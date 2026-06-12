import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Gera um código de 8 dígitos aleatório
    const code = Math.floor(10000000 + Math.random() * 90000000).toString()

    // O email do administrador é sempre fixo
    const adminEmail = 'nelsonarantes2007@gmail.com'

    // Salva o código na tabela admin_auth_codes (expira em 10 minutos)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    const { error: dbError } = await supabaseClient
      .from('admin_auth_codes')
      .insert({
        code,
        expires_at: expiresAt,
        used: false
      })

    if (dbError) throw dbError

    // Chama o serviço de email (Exemplo via Resend)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'AgroPet Admin <onboarding@resend.dev>', // Modifique para o domínio do AgroPet depois
          to: [adminEmail],
          subject: 'Código de Login Administrador - AgroPet',
          html: `<p>O seu código de acesso de administrador é: <strong>${code}</strong></p><p>Este código expira em 10 minutos.</p>`
        })
      })
      if (!res.ok) {
        console.error('Failed to send email:', await res.text())
      }
    } else {
      console.warn('RESEND_API_KEY not found. Code was generated but email was not sent. Code:', code)
    }

    return new Response(
      JSON.stringify({ message: "Código enviado com sucesso!" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
