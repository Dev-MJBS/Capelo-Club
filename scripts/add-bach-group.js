require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    console.error('Você precisa de NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY em .env.local');
    process.exit(1);
}

// Usar service role key se disponível (para bypass RLS), caso contrário usar anon key
const key = supabaseServiceKey || supabaseKey;
const supabase = createClient(supabaseUrl, key);

const newGroup = {
    title: 'Fãs de Richard Bach',
    book_title: 'Fernão Capelo Gaivota',
    description: 'Universo do admin'
};

async function createGroup() {
    try {
        console.log('📚 Criando grupo...');
        
        const { data, error } = await supabase
            .from('groups')
            .insert([newGroup])
            .select();

        if (error) {
            console.error('❌ Erro ao criar grupo:', error.message);
            process.exit(1);
        }

        console.log('✅ Grupo criado com sucesso!');
        console.log(`\nDetalhes:`);
        console.log(`  📖 Título: ${data[0].title}`);
        console.log(`  📚 Livro: ${data[0].book_title}`);
        console.log(`  📝 Descrição: ${data[0].description}`);
        console.log(`  🆔 ID: ${data[0].id}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

createGroup();
