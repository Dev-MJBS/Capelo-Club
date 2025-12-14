require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testGroup = {
    title: 'Fernão Capelo Gaivota',
    book_title: 'Fernão Capelo Gaivota',
    description: 'Grupo de teste para discussões sobre a história de Fernão Capelo Gaivota.'
};

async function createTestGroup() {
    try {
        console.log('📚 Criando grupo de teste...');
        
        const { data, error } = await supabase
            .from('groups')
            .insert([testGroup])
            .select();

        if (error) {
            console.error('❌ Erro ao criar grupo:', error.message);
            process.exit(1);
        }

        console.log('✅ Grupo criado com sucesso!');
        console.log(`Grupo: ${data[0].title}`);
        console.log(`Livro: ${data[0].book_title}`);
        console.log(`ID: ${data[0].id}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

createTestGroup();
