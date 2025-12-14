require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    console.error('Precisa de: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDeletePolicy() {
    try {
        console.log('🔧 Atualizando política RLS para delete...');

        // Executar SQL para atualizar a política
        const { error } = await supabase.rpc('exec_sql', {
            sql: `
                DROP POLICY IF EXISTS "Admins can delete posts." on posts;
                CREATE POLICY "Users can delete own posts." ON posts
                  FOR DELETE USING (auth.uid() = user_id);
            `
        });

        if (error) {
            // Se rpc não funcionar, vamos tentar direto com a função que podem existir
            console.log('❌ RPC exec_sql não disponível. Execute manualmente no Supabase SQL Editor:');
            console.log('');
            console.log('DROP POLICY IF EXISTS "Admins can delete posts." on posts;');
            console.log('CREATE POLICY "Users can delete own posts." ON posts');
            console.log('  FOR DELETE USING (auth.uid() = user_id);');
            console.log('');
            process.exit(0);
        }

        console.log('✅ Política RLS atualizada com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message || error);
        console.log('\nExecute manualmente no Supabase SQL Editor:');
        console.log('DROP POLICY IF EXISTS "Admins can delete posts." on posts;');
        console.log('CREATE POLICY "Users can delete own posts." ON posts');
        console.log('  FOR DELETE USING (auth.uid() = user_id);');
        process.exit(1);
    }
}

fixDeletePolicy();
