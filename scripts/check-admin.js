require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
    try {
        console.log('🔍 Verificando perfil do admin...\n');
        
        // Primeiro encontrar o usuário pelo email
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.error('❌ Erro ao buscar usuários:', usersError.message);
            process.exit(1);
        }
        
        if (!users || !Array.isArray(users.users)) {
            console.error('❌ Nenhum usuário encontrado!');
            process.exit(1);
        }
        
        const authUser = users.users.find(u => u.email === 'mjbs.dev@gmail.com');
        
        if (!authUser) {
            console.error('❌ Usuário mjbs.dev@gmail.com não encontrado em auth.users!');
            process.exit(1);
        }
        
        console.log(`✅ Usuário encontrado em auth.users: ${authUser.id}`);
        
        // Agora buscar o perfil
        let { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, is_admin, is_verified')
            .eq('id', authUser.id);
        
        if (error) {
            console.error('❌ Erro:', error.message);
            process.exit(1);
        }
        
        // Se não encontrar o perfil, criar um
        if (!profiles || profiles.length === 0) {
            console.log('⚠️  Perfil não encontrado, criando...');
            
            const username = authUser.email?.split('@')[0] || 'user';
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: authUser.id,
                    username: username,
                    avatar_url: authUser.user_metadata?.avatar_url || null,
                    is_admin: true,
                    is_verified: true
                })
                .select()
                .single();
            
            if (createError) {
                console.error('❌ Erro ao criar perfil:', createError.message);
                process.exit(1);
            }
            
            profiles = [newProfile];
        }
        
        const profile = profiles[0];
        console.log('\n✅ Perfil encontrado/criado:');
        console.log(`   ID: ${profile.id}`);
        console.log(`   Email: ${authUser.email}`);
        console.log(`   Username: ${profile.username}`);
        console.log(`   Is Admin: ${profile.is_admin}`);
        console.log(`   Is Verified: ${profile.is_verified}`);
        
        if (!profile.is_admin) {
            console.log('\n❌ Usuário NÃO é admin!');
            process.exit(1);
        }
        
        console.log('\n✅ Usuário é admin!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

checkAdmin();
