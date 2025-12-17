# 👤 Guia de Perfis de Usuário Enriquecidos

## O que foi implementado?

Um sistema completo de perfis de usuário com estatísticas, badges (conquistas), bio personalizada e histórico de atividades!

## 🎯 Funcionalidades

### 1. **Página de Perfil** (`/profile/[username]`)

Cada usuário agora tem uma página de perfil completa com:

- **Avatar e Informações Básicas**
  - Foto de perfil
  - Username com badge de verificado (se aplicável)
  - Data de entrada na comunidade

- **Bio Personalizada**
  - Descrição pessoal (até 500 caracteres)
  - Livro favorito
  - Gênero literário preferido

- **Estatísticas em Tempo Real**
  - 📝 Total de posts criados
  - ❤️ Total de curtidas recebidas
  - 💬 Total de comentários feitos

- **Sistema de Badges (Conquistas)**
  - 🌟 Novato - Primeiro post
  - 📖 Leitor Ativo - 10+ posts
  - ✍️ Escritor Prolífico - 50+ posts
  - 🔥 Influencer - 100+ curtidas
  - ⭐ Estrela - 500+ curtidas
  - 💬 Conversador - 50+ comentários
  - 🗣️ Debatedor - 200+ comentários
  - 🏆 Veterano - 180+ dias de membro
  - 👑 Lenda - 365+ dias de membro

- **Histórico de Posts**
  - 10 posts mais recentes
  - Link direto para cada post
  - Contador de curtidas por post

### 2. **Editar Perfil** (`/settings/profile`)

Página para editar suas informações:

- Bio (até 500 caracteres)
- Livro favorito
- Gênero favorito
- Links sociais (opcional):
  - Website
  - Twitter/X
  - Instagram

### 3. **Badges Automáticos**

Os badges são **concedidos automaticamente** quando você:
- Cria posts
- Recebe curtidas
- Faz comentários
- Passa tempo na comunidade

**Não precisa fazer nada!** O sistema calcula e concede automaticamente.

## 🧪 Como Usar

### Ver um Perfil:

1. **Clique em qualquer username** nos posts
2. Você será levado para `/profile/[username]`
3. Veja estatísticas, badges e posts recentes

### Editar Seu Perfil:

1. Vá para seu perfil clicando no seu username
2. Clique em **"Editar Perfil"**
3. Preencha bio, livro favorito, gênero
4. Adicione links sociais (opcional)
5. Clique em **"Salvar Alterações"**

### Ganhar Badges:

1. **Seja ativo!** Crie posts, comente, receba curtidas
2. Os badges são concedidos **automaticamente**
3. Veja seus badges no seu perfil
4. Passe o mouse sobre um badge para ver a descrição

## 📊 Banco de Dados

### Novas Tabelas:

**`badges`** - Tipos de conquistas
- name, slug, description
- icon (emoji), color
- requirement_type, requirement_value

**`user_badges`** - Badges conquistados
- user_id, badge_id
- earned_at (quando ganhou)

### Novos Campos em `profiles`:

- `bio` - Biografia pessoal
- `favorite_book` - Livro favorito
- `favorite_genre` - Gênero preferido
- `website_url` - Site pessoal
- `twitter_handle` - @username do Twitter
- `instagram_handle` - @username do Instagram

### Funções SQL:

**`get_user_stats(user_uuid)`**
- Retorna estatísticas do usuário
- posts_count, likes_received, comments_count, member_days

**`check_and_award_badges(user_uuid)`**
- Verifica requisitos de badges
- Concede badges automaticamente
- Chamada após cada post criado

## 🎨 Componentes Criados

### `BadgeDisplay`
- Exibe badges com cores e ícones
- Tooltip com descrição ao passar o mouse
- Tamanhos: sm, md, lg

### Páginas:
- `/profile/[username]` - Perfil público
- `/settings/profile` - Editar perfil

## 🚀 Próximos Passos

Agora você pode:

1. ✅ Ver perfis completos de usuários
2. ✅ Editar seu próprio perfil
3. ✅ Ganhar badges automaticamente
4. ✅ Ver estatísticas em tempo real
5. ✅ Conhecer melhor a comunidade

## 🎯 Benefícios

- **Gamificação** - Badges motivam participação
- **Comunidade** - Conhecer outros leitores
- **Credibilidade** - Histórico visível
- **Personalização** - Expressar personalidade
- **Engajamento** - Usuários voltam para ver stats

## ⚠️ Importante

**Rode a migração!**

Vá no Supabase Dashboard → SQL Editor e execute:
```
supabase/migrations/20241217_user_profiles.sql
```

Isso cria as tabelas, badges padrão e funções automáticas!
