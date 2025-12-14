require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedGroups();
