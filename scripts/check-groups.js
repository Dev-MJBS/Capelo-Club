require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGroups() {
    try {
        console.log('📋 Verificando grupos no banco de dados...\n');
        
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Erro ao consultar grupos:', error.message);
            process.exit(1);
        }

        if (!data || data.length === 0) {
            console.log('⚠️  Nenhum grupo encontrado no banco de dados.');
            console.log('\nPara adicionar grupos, execute:');
            console.log('  npm run seed:groups');
            console.log('\nMas antes, configure SUPABASE_SERVICE_ROLE_KEY em .env.local');
            process.exit(0);
        }

        console.log(`✅ Encontrados ${data.length} grupo(s):\n`);
        data.forEach((group, index) => {
            console.log(`${index + 1}. ${group.title}`);
            console.log(`   Livro: ${group.book_title}`);
            console.log(`   Descrição: ${group.description}`);
            console.log(`   ID: ${group.id}`);
            console.log(`   Criado em: ${new Date(group.created_at).toLocaleDateString('pt-BR')}\n`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        process.exit(1);
    }
}

checkGroups();
