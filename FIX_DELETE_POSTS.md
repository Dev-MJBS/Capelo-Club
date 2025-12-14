# 🔧 Corrigindo a Política de Delete de Posts

Se você está tendo problemas ao deletar seus próprios posts, siga estes passos:

## Passo 1: Acesse o Supabase SQL Editor

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Clique em **New Query**

## Passo 2: Execute o Comando SQL

Cole e execute o seguinte comando:

```sql
DROP POLICY IF EXISTS "Admins can delete posts." on posts;
CREATE POLICY "Users can delete own posts." ON posts
  FOR DELETE USING (auth.uid() = user_id);
```

## Passo 3: Pronto!

Agora você poderá deletar seus próprios posts! 🗑️

---

## O que mudou?

**Antes**: Apenas admins podiam deletar posts  
**Depois**: Usuários podem deletar seus próprios posts

A policy agora verifica se o ID do usuário autenticado (`auth.uid()`) é igual ao `user_id` do post. Se forem iguais, o post pode ser deletado.

---

## Testando

1. Acesse http://localhost:3000
2. Faça login
3. Crie um post
4. Clique no ícone 🗑️ no seu próprio post
5. Confirme a deleção
6. Post deve desaparecer! ✅
