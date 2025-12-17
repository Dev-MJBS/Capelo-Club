# 🔔 Guia do Sistema de Notificações

## O que foi implementado?

Um sistema completo de notificações em tempo real para aumentar o engajamento dos usuários!

## 🎯 Funcionalidades

### 1. **Centro de Notificações**
- Dropdown clicável no ícone de sino (🔔)
- Badge vermelho com contador de não lidas
- Lista das últimas 20 notificações
- Scroll infinito para ver mais

### 2. **Tipos de Notificações**

- **❤️ Curtidas** - Quando alguém curte seu post
- **💬 Comentários** - Quando alguém comenta em seu post
- **🏆 Badges** - Quando você ganha uma conquista
- **@ Menções** - Quando alguém te menciona (futuro)
- **👥 Seguidores** - Quando alguém te segue (futuro)

### 3. **Notificações em Tempo Real**
- Usa Supabase Realtime
- Notificações aparecem instantaneamente
- Sem precisar recarregar a página
- Contador atualiza automaticamente

### 4. **Gerenciamento**
- Marcar individual como lida (clicando)
- Marcar todas como lidas (botão no topo)
- Link direto para o post/conteúdo relacionado
- Timestamp relativo ("há 2 minutos")

## 📊 Banco de Dados

### Tabela `notifications`:
```sql
- id: UUID
- user_id: UUID (quem recebe)
- type: VARCHAR (like, comment, badge, etc)
- title: TEXT
- message: TEXT
- link: TEXT (URL para navegar)
- read: BOOLEAN
- actor_id: UUID (quem causou a notificação)
- post_id: UUID (post relacionado)
- created_at: TIMESTAMP
```

### Triggers Automáticos:

**1. Curtidas** → Notifica autor do post
```sql
CREATE TRIGGER trigger_notify_post_liked
    AFTER INSERT ON public.likes
```

**2. Comentários** → Notifica autor do post
```sql
CREATE TRIGGER trigger_notify_post_commented
    AFTER INSERT ON public.posts
```

**3. Badges** → Notifica usuário que ganhou
```sql
CREATE TRIGGER trigger_notify_badge_earned
    AFTER INSERT ON public.user_badges
```

## 🧪 Como Testar

### 1. **Rode a Migração**
```sql
-- No Supabase SQL Editor
supabase/migrations/20241217_notifications.sql
```

### 2. **Teste Curtidas**
1. Faça login com usuário A
2. Crie um post
3. Faça login com usuário B
4. Curta o post do usuário A
5. Volte para usuário A
6. Veja a notificação aparecer! 🔔

### 3. **Teste Comentários**
1. Usuário B comenta no post do usuário A
2. Usuário A recebe notificação instantânea

### 4. **Teste Badges**
1. Crie seu primeiro post
2. Receba notificação do badge "Novato 🌟"

## 🎨 UI/UX

### Badge de Contador:
```
🔔 (3)  ← Bolinha vermelha com número
```

### Dropdown:
```
┌─────────────────────────────────────┐
│ Notificações  [Marcar todas lidas]  │
├─────────────────────────────────────┤
│ ❤️ Nova curtida!                    │
│    João curtiu seu post: "Harry..." │
│    há 2 minutos                  •  │
├─────────────────────────────────────┤
│ 💬 Novo comentário!                 │
│    Maria comentou em: "1984..."     │
│    há 5 minutos                     │
├─────────────────────────────────────┤
│ 🏆 Nova conquista desbloqueada!     │
│    Você ganhou: 📖 Leitor Ativo     │
│    há 1 hora                        │
└─────────────────────────────────────┘
```

## 🚀 Recursos Avançados

### Real-time com Supabase:
```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Adiciona notificação instantaneamente
  })
  .subscribe()
```

### Funções SQL:
- `create_notification()` - Cria notificação
- `mark_notification_read()` - Marca como lida
- `mark_all_notifications_read()` - Marca todas
- `get_unread_notifications_count()` - Conta não lidas

## 📝 Próximos Passos (Futuro)

- [ ] Notificações de menções (@username)
- [ ] Notificações de seguidores
- [ ] Preferências de notificação (ativar/desativar)
- [ ] Notificações por email
- [ ] Notificações push (PWA)
- [ ] Som ao receber notificação
- [ ] Página dedicada `/notifications`

## ⚠️ Importante

**Rode a migração!**
```
supabase/migrations/20241217_notifications.sql
```

Isso cria:
- ✅ Tabela de notificações
- ✅ Triggers automáticos
- ✅ Funções SQL
- ✅ RLS policies

## 🎉 Resultado

Agora os usuários:
- ✅ Recebem notificações instantâneas
- ✅ Veem contador de não lidas
- ✅ Clicam para ir direto ao conteúdo
- ✅ Gerenciam notificações facilmente
- ✅ Voltam mais ao site! 📈

**Engajamento garantido!** 🚀
