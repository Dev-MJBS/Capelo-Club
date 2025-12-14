require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Configuração incompleta!');
    console.error('Variáveis necessárias:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.log('\nPara obter a Service Role Key:');
    console.log('  1. Acesse https://app.supabase.com/project/[seu-projeto]/settings/api');
    console.log('  2. Copie a "Service Role" key');
    console.log('  3. Adicione em .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const groups = [
    {
        title: 'Clube do Duna',
        book_title: 'Duna',
        description: 'Discussões sobre o universo de Frank Herbert.'
    },
    {
        title: 'Leitores de 1984',
        book_title: '1984',
        description: 'O Grande Irmão está de olho.'
    },
    {
        title: 'Fãs de Harry Potter',
        book_title: 'Harry Potter e a Pedra Filosofal',
        description: 'O menino que sobreviveu.'
    }
];

async function seedGroups() {
    try {
        console.log('📚 Inserindo grupos...');
        
        // Primeiro, deletar grupos existentes para evitar duplicatas
        const { error: deleteError } = await supabase
            .from('groups')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Sempre true, deleta tudo

        if (deleteError && !deleteError.message.includes('no rows')) {
            console.warn('⚠️  Aviso ao limpar grupos antigos:', deleteError.message);
        }

        // Inserir novos grupos
        const { data, error } = await supabase
            .from('groups')
            .insert(groups)
            .select();

        if (error) {
            console.error('❌ Erro ao inserir grupos:', error.message);
            process.exit(1);
        }

        console.log('✅ Grupos criados com sucesso!');
        console.log(`Grupos inseridos: ${data.length}`);
        data.forEach(group => {
            console.log(`  - ${group.title} (${group.book_title})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro inesperado:', error.message || error);
        process.exit(1);
    }
}

seedGroups();
