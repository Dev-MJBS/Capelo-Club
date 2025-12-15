require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateProfile() {
    try {
        const email = 'mjbs.dev@gmail.com';
        const newUsername = 'Mateus Job';
        
        console.log(`🔧 Atualizando perfil para: ${email}`);
        
        // 1. Buscar o usuário pelo email na tabela auth.users para pegar o ID
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.error('❌ Erro ao listar usuários:', listError.message);
            process.exit(1);
        }

        const user = users.find(u => u.email === email);
        
        if (!user) {
            console.error(`❌ Usuário com email ${email} não encontrado!`);
            process.exit(1);
        }

        console.log(`✅ Usuário encontrado: ${user.id}`);

        // 2. Atualizar a tabela profiles
        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                username: newUsername,
                is_verified: true,
                is_admin: true
                // avatar_url: user.user_metadata.avatar_url // Mantém o que veio do Google/Auth se já estiver lá, ou atualiza se necessário
            })
            .eq('id', user.id)
            .select();

        if (error) {
            console.error('❌ Erro ao atualizar perfil:', error.message);
        } else {
            console.log('✅ Perfil atualizado com sucesso!');
            console.log(data);
        }

    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

updateProfile();
