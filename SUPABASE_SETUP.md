# Setup do Supabase - Guia Completo

## 1. Executar Schema SQL no Supabase

1. Acesse https://app.supabase.com/ e escolha seu projeto
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `supabase/schema.sql`
5. Clique em **Run**

Isso criará todas as tabelas e políticas RLS necessárias.

## 2. Adicionar Service Role Key ao .env.local

Para executar os scripts de seed (criar grupos padrão), você precisa da Service Role Key:

1. Acesse https://app.supabase.com/project/[seu-projeto]/settings/api
2. Copie a **Service Role** (chave longa)
3. Abra `.env.local` e adicione:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
   ```

## 3. Criar Grupos Padrão

Com a Service Role Key configurada, execute:

```bash
npm run seed:groups
```

Isso criará 3 grupos padrão:
- Clube do Duna
- Leitores de 1984
- Fãs de Harry Potter

## 4. Testar a Aplicação

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse http://localhost:3000
3. Faça login com sua conta Google
4. Vá para "Criar Nova Discussão" e teste criar um post

## Troubleshooting

### "row-level security policy for table 'groups'"
- A política RLS para INSERT não existe
- Solução: Execute o SQL do schema.sql novamente, focando na criação das políticas

### "relation 'groups' does not exist"
- A tabela não foi criada
- Solução: Execute todo o arquivo `supabase/schema.sql` do início

### Script retorna erro de autenticação
- Você não está usando a Service Role Key
- Solução: Configure `SUPABASE_SERVICE_ROLE_KEY` em `.env.local`

## Arquivos Importantes

- `.env.local` - Configurações de ambiente (não versionado)
- `supabase/schema.sql` - Schema do banco de dados
- `scripts/seed-groups.js` - Script para criar grupos padrão
- `src/lib/supabase/client.ts` - Cliente Supabase para operações do cliente
- `src/lib/supabase/server.ts` - Cliente Supabase para operações do servidor
