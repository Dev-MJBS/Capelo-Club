#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const founderEmails = [
    'helgarkulfseks@gmail.com',
    'ronildop123@gmail.com',
    'jarina.rina.rina@gmail.com',
    'morethsonn@gmail.com',
    'mjbs.dev@gmail.com',
    'mateusjob.brito@gmail.com',
    'clarissa7999@gmail.com',
    'acaiahfilmes@gmail.com',
    'adm.aliceoliveira@gmail.com',
    'henriquetostadias@gmail.com',
    'guilherme95199@gmail.com',
    'isabmarquetti@gmail.com',
    'pedrxxxleaop@gmail.com',
    'ju.spinelli@gmail.com',
    'luciano.robaski@gmail.com',
    'carolinahallal@usp.br',
    'juliiaalves543@gmail.com',
    'victoriamp456@gmail.com',
    'cassiosarapiao44@gmail.com',
    'pr3ttyeli@gmail.com',
    'carolgirasol334457@gmail.com',
    'macielpamplonaa@gmail.com',
    'raquelsilveira180506@gmail.com',
    'mjobbrito@gmail.com'
];

async function markFounders() {
    try {
        console.log(`🌟 Marcando ${founderEmails.length} membros como fundadores...`);

        // Get user IDs from emails using admin API
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.error('❌ Erro ao buscar usuários:', usersError);
            process.exit(1);
        }

        const founderUserIds = users
            .filter(u => founderEmails.includes(u.email))
            .map(u => u.id);

        if (founderUserIds.length === 0) {
            console.error('❌ Nenhum usuário encontrado com esses emails');
            process.exit(1);
        }

        console.log(`✅ Encontrados ${founderUserIds.length} usuários`);

        // Update profiles to mark as founder
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_founder: true })
            .in('user_id', founderUserIds);

        if (updateError) {
            console.error('❌ Erro ao atualizar perfis:', updateError);
            process.exit(1);
        }

        console.log(`✅ ${founderUserIds.length} membros marcados como fundadores com sucesso!`);
        console.log('🎉 Todos os badges foram concedidos automaticamente pelo trigger do banco de dados');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

markFounders();
