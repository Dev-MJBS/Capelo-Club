# 🏷️ Guia do Sistema de Tags - Capelo Club

## O que são Tags?

Tags são **categorias/etiquetas** que você adiciona aos posts para organizá-los melhor, como hashtags!

### Exemplos Práticos:
- Post sobre "Harry Potter" → Tags: `Fantasia` 🧙, `Young Adult` 🌟, `Recomendação` ⭐
- Post sobre "1984" → Tags: `Clássico` 🎭, `Ficção Científica` 🚀, `Discussão` 💬
- Post sobre "A Culpa é das Estrelas" → Tags: `Romance` 💕, `Young Adult` 🌟, `Resenha` ✍️

## Onde as Tags Aparecem?

### 1. **No Dashboard** (Página Principal)
- Você verá um card rosa **"Explore por Tags"** na sidebar direita
- Clique em "Ver Todas as Tags 🏷️" para ver todas as categorias

### 2. **Nos Posts**
- Abaixo do conteúdo do post, antes dos botões de ação
- Tags aparecem como badges coloridos clicáveis
- Exemplo: `Romance` 💕 `Fantasia` 🧙 `Recomendação` ⭐

### 3. **Página de Tags** (`/tags`)
- Lista todas as tags disponíveis
- Mostra quantos posts cada tag tem
- Grid organizado por popularidade

### 4. **Página de Tag Individual** (`/tags/romance`)
- Mostra todos os posts com aquela tag específica
- Filtro automático

## Como Usar?

### Para Ver Tags:
1. ✅ **Rode a migração primeiro!**
   - Vá no Supabase Dashboard → SQL Editor
   - Execute o arquivo: `supabase/migrations/20241217_tags_system.sql`
   - Isso cria as tabelas e 12 tags padrão

2. ✅ **Acesse o Dashboard**
   - Você verá o card rosa "Explore por Tags"
   - Clique para ver todas as tags

3. ✅ **Clique em uma tag**
   - Veja todos os posts daquela categoria

### Para Adicionar Tags aos Posts:
**PRÓXIMO PASSO:** Vou adicionar o TagSelector no formulário de criar posts!

## Tags Padrão Criadas:

| Tag | Emoji | Cor | Descrição |
|-----|-------|-----|-----------|
| Romance | 💕 | Rosa | Livros de romance e amor |
| Ficção Científica | 🚀 | Azul | Sci-fi e futurismo |
| Fantasia | 🧙 | Roxo | Mundos mágicos |
| Mistério | 🔍 | Índigo | Suspense e investigação |
| Terror | 👻 | Vermelho | Horror psicológico |
| Biografia | 📖 | Laranja | Histórias de vida reais |
| Não-ficção | 📚 | Verde | Livros informativos |
| Clássico | 🎭 | Marrom | Obras clássicas |
| Young Adult | 🌟 | Rosa Claro | Literatura jovem |
| Discussão | 💬 | Cinza | Discussões gerais |
| Recomendação | ⭐ | Turquesa | Recomendações |
| Resenha | ✍️ | Roxo Claro | Resenhas e análises |

## Benefícios:

✅ **Organização** - Posts categorizados automaticamente
✅ **Descoberta** - Usuários encontram posts por interesse
✅ **Navegação** - Filtros rápidos por categoria
✅ **Visual** - Badges coloridos deixam o feed mais bonito
✅ **Comunidade** - Facilita encontrar discussões sobre temas específicos

## Próximos Passos:

1. ⏳ Adicionar TagSelector no formulário de criar posts
2. ⏳ Permitir usuários sugerirem novas tags
3. ⏳ Adicionar trending tags (mais usadas)
4. ⏳ Notificações de novas posts em tags favoritas
