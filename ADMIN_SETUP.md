# 👑 Como Se Tornar Admin

## Passo 1: Atualizar o Schema do Supabase

Execute este comando SQL no Supabase SQL Editor:

```sql
-- Adicionar colunas de admin e verificado
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean default false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean default false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- Atualizar policies de grupos
DROP POLICY IF EXISTS "Authenticated users can create groups." on groups;
DROP POLICY IF EXISTS "Admins can delete posts." on posts;

CREATE POLICY "Only admins can create groups." ON groups
  FOR INSERT WITH CHECK (
    auth.uid() in (
      select id from profiles where is_admin = true
    )
  );

CREATE POLICY "Only admins can delete groups." ON groups
  FOR DELETE USING (
    auth.uid() in (
      select id from profiles where is_admin = true
    )
  );

CREATE POLICY "Users can delete own posts." ON posts
  FOR DELETE USING (auth.uid() = user_id);
```

## Passo 2: Adicionar o Email no Script

Edit o arquivo `scripts/make-admin.js` e altereatualizar o email se necessário:

```javascript
const email = 'mjbs.dev@gmail.com';
```

## Passo 3: Executar o Script

```bash
npm run make:admin
```

Este comando vai:
✅ Encontrar o usuário com seu email
✅ Marcar como admin (`is_admin = true`)
✅ Marcar como verificado (`is_verified = true`)

## Passo 4: Verificar

1. Acesse http://localhost:3000/dashboard
2. Você verá um ícone de ⚙️ (Settings) na navbar
3. Clique para acessar o painel de admin

## O que Você Pode Fazer Agora

✅ **Criar novos grupos** - Página Admin
✅ **Deletar grupos** - Na página admin (vem em breve)
✅ **Ter um selo azul ✓** - Aparece ao lado do seu username
✅ **Gerenciar grupos** - Interface completa no `/admin`

## Features do Admin

- 👑 Painel de administração dedicado
- ✨ Criar grupos com nome, livro e descrição
- 📊 Ver estatísticas (total de grupos)
- 🔐 Apenas você pode acessar

---

**Se tiver problemas:**
1. Verifique se fez login com `mjbs.dev@gmail.com`
2. Execute novamente: `npm run make:admin`
3. Atualize a página no navegador (F5)
