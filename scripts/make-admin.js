require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin() {
    try {
        const email = 'mjbs.dev@gmail.com';
        
        console.log(`🔧 Procurando usuário com email: ${email}`);
        
        // Buscar o usuário pelo email usando a tabela profiles
        const { data: profiles, error: searchError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('email', email);
        
        // Se não encontrar na profiles, buscar na tabela auth.users
        if (searchError || !profiles || profiles.length === 0) {
            // Tenta encontrar pelo email na tabela de autenticação
            const { data: users, error: listError } = await supabase.auth.admin.listUsers();
            
            if (listError) {
                console.error('❌ Erro ao buscar usuários:', listError.message);
                process.exit(1);
            }
            
            if (!users || !Array.isArray(users.users)) {
                console.error('❌ Nenhum usuário encontrado!');
                process.exit(1);
            }
            
            var user = users.users.find(u => u.email === email);
            
            if (!user) {
                console.error(`❌ Usuário com email ${email} não encontrado!`);
                console.log('Usuários existentes:');
                users.users.forEach(u => console.log(`  - ${u.email}`));
                process.exit(1);
            }
        } else {
            var user = { id: profiles[0].id, email: email };
        }
        
        console.log(`✅ Usuário encontrado: ${user.id}`);
        
        // Atualizar o perfil para ser admin e verified
        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                is_admin: true, 
                is_verified: true 
            })
            .eq('id', user.id)
            .select();
        
        if (error) {
            console.error('❌ Erro ao atualizar perfil:', error.message);
            process.exit(1);
        }
        
        console.log('✅ Admin e verificado configurado com sucesso!');
        console.log('Dados atualizados:', data);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro inesperado:', error.message || error);
        process.exit(1);
    }
}

makeAdmin();
