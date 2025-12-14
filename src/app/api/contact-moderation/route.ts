import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { message } = await request.json()
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Aqui você pode integrar com um serviço de email como Resend, SendGrid, ou usar a API do Supabase
        // Por enquanto, vamos apenas logar (você deve substituir com envio real de email)
        
        console.log('📧 Mensagem de contato da moderação:', {
            from: user.email,
            message,
            timestamp: new Date()
        })

        // TODO: Implementar envio real de email para mjbs.dev@gmail.com
        // Exemplo com fetch para um serviço de email:
        // const emailResponse = await fetch('https://api.resend.com/emails', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         from: 'noreply@capelo-club.com',
        //         to: 'mjbs.dev@gmail.com',
        //         subject: 'Nova mensagem de contato - Capelo Club',
        //         html: `<p>De: ${user.email}</p><p>${message}</p>`
        //     })
        // })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
