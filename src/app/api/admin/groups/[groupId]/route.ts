import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const { groupId } = await params
        const supabase = await createClient()

        // Verificar se o usuário é admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { message: 'Não autenticado' },
                { status: 401 }
            )
        }

        const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) {
            return NextResponse.json(
                { message: 'Você não tem permissão para deletar grupos' },
                { status: 403 }
            )
        }

        // Deletar o grupo
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', groupId)

        if (error) {
            return NextResponse.json(
                { message: `Erro ao deletar grupo: ${error.message}` },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Grupo deletado com sucesso' },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
            { status: 500 }
        )
    }
}
