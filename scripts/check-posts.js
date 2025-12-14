require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPosts() {
    try {
        console.log('🔍 Verificando posts no banco...\n');
        
        // Contar total de posts
        const { count, error: countError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Erro ao contar posts:', countError.message);
            process.exit(1);
        }
        
        console.log(`📊 Total de posts: ${count || 0}`);
        
        // Buscar os últimos 10 posts
        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, title, content, user_id, group_id, created_at, likes_count')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('❌ Erro ao buscar posts:', error.message);
            process.exit(1);
        }
        
        if (!posts || posts.length === 0) {
            console.log('\n⚠️  Nenhum post encontrado!');
            process.exit(0);
        }
        
        console.log('\n✅ Últimos posts encontrados:\n');
        posts.forEach((post, index) => {
            console.log(`${index + 1}. "${post.title}"`);
            console.log(`   ID: ${post.id}`);
            console.log(`   Grupo: ${post.group_id}`);
            console.log(`   Usuário: ${post.user_id}`);
            console.log(`   Data: ${new Date(post.created_at).toLocaleString('pt-BR')}`);
            console.log(`   Likes: ${post.likes_count}`);
            console.log(`   Conteúdo: ${post.content.substring(0, 50)}...`);
            console.log();
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

checkPosts();
