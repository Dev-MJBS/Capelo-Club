require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está configurada!');
    process.exit(1);
}

// Preferir Service Role Key para operações de admin
const key = supabaseServiceKey || supabaseAnonKey;

if (!key) {
    console.error('❌ Nenhuma chave do Supabase configurada!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, key);

async function addRLSPolicy() {
    try {
        console.log('🔒 Adicionando política RLS para tabela groups...');
        
        // Executar comando SQL para adicionar a política
        const { error } = await supabase.rpc('sql', {
            query: `create policy "Authenticated users can create groups." on groups
                    for insert with check (auth.role() = 'authenticated');`
        });

        if (error && error.message.includes('already exists')) {
            console.log('✅ Política já existe');
        } else if (error) {
            console.error('❌ Erro ao adicionar política:', error.message);
            // Continue mesmo se falhar - pode ser que a política já exista
        } else {
            console.log('✅ Política RLS adicionada com sucesso!');
        }

        // Agora tentar inserir os grupos
        console.log('📚 Inserindo grupos...');
        
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

        const { data, error: insertError } = await supabase
            .from('groups')
            .insert(groups)
            .select();

        if (insertError) {
            console.error('❌ Erro ao inserir grupos:', insertError.message);
            process.exit(1);
        }

        console.log('✅ Grupos criados com sucesso!');
        console.log(`Grupos inseridos: ${data.length}`);
        data.forEach(group => {
            console.log(`  - ${group.title} (${group.book_title})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        process.exit(1);
    }
}

addRLSPolicy();
