# 🚀 Capelo Club - Guia de Setup Completo

Bem-vindo ao **Capelo Club**, uma plataforma de clube de leitura digital!

## 📋 Pré-requisitos

Você precisa ter:
- [Node.js 18+](https://nodejs.org/) instalado
- Uma conta no [Supabase](https://supabase.com/) (gratuita)
- Google OAuth configurado (para login)

## 🔧 Passo 1: Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Preencha com suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
   ```

### Como obter essas chaves:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Settings → API**
4. Copie:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (↓ scroll para ver)

## 🗄️ Passo 2: Criar Schema do Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **Run**

Este comando:
- ✅ Cria tabelas: `profiles`, `groups`, `posts`
- ✅ Configura segurança com RLS (Row Level Security)
- ✅ Cria triggers para sincronizar usuários automaticamente
- ✅ Adiciona 3 grupos padrão para teste

## 🌱 Passo 3: Popular Banco com Grupos (Opcional)

Se você quer adicionar os 3 grupos padrão de teste:

```bash
npm run seed:groups
```

Isso cria:
- **Clube do Duna** - Frank Herbert's Dune universe
- **Leitores de 1984** - George Orwell's dystopian classic
- **Fãs de Harry Potter** - Magical wizarding world

## 🔐 Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou use um existente
3. Vá para **APIs & Services → Credentials**
4. Clique em **Create Credentials → OAuth 2.0 Client ID**
5. Selecione **Web application**
6. Adicione URIs autorizados:
   - `http://localhost:3000`
   - `https://seu-projeto.vercel.app` (quando fazer deploy)
7. Copie o Client ID e Client Secret
8. No Supabase:
   - Vá para **Authentication → Providers → Google**
   - Cole o Client ID e Secret
   - Ative o provider
   - Copie a URL de callback e adicione em Google Cloud Console

## 🚀 Iniciar Desenvolvimento

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 📱 Usar a Aplicação

### Primeira vez?
1. Clique em "Login com Google"
2. Autorize o acesso
3. Você será redirecionado para o dashboard
4. Vá em "Criar Nova Discussão" para fazer seu primeiro post

### Criar um Post
1. Clique em "Criar Nova Discussão"
2. Selecione um grupo (livro)
3. Escreva um título e conteúdo
4. (Opcional) Adicione uma imagem
5. Clique "Publicar"

### Denunciar um Post
1. Abra qualquer post
2. Clique no ícone 🚩 de denúncia
3. Selecione o motivo
4. Clique "Enviar Denúncia"

### Contatar Moderadores
1. Clique no botão 💬 flutuante no canto inferior direito
2. Escreva sua mensagem
3. Clique "Enviar"

## 🛠️ Comandos Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar modo produção
npm start

# Verificar ESLint
npm run lint

# Verificar grupos no banco
npm run check:groups

# Criar grupos padrão
npm run seed:groups

# Criar um grupo de teste
npm run create:test-group

# Adicionar grupo Richard Bach
npm run add:bach
```

## 🐛 Troubleshooting

### "Error: relation 'groups' does not exist"
A tabela não foi criada. Execute o schema.sql novamente no SQL Editor do Supabase.

### "row-level security policy" error
A política RLS não permite suas operações. Verifique se o schema.sql foi executado completo.

### Posts não aparecem no dashboard
- Verifique se há grupos criados: `npm run check:groups`
- Se não houver grupos, execute: `npm run seed:groups`
- Certifique-se de estar logado

### Erro ao fazer upload de imagem
Supabase Storage bucket ainda não está configurado (feature em desenvolvimento).

### Google Login não funciona
1. Verifique se o Google OAuth está ativado no Supabase (Authentication → Providers)
2. Confirme que o Client ID e Secret estão corretos
3. Adicione `http://localhost:3000` em "Authorized origins" no Google Cloud Console

## 📚 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Autenticação (callback, logout)
│   ├── dashboard/         # Feed principal
│   ├── group/[id]/        # Página de grupo específico
│   ├── create-post/       # Criar novo post
│   ├── profile/           # Perfil do usuário
│   ├── notifications/     # Notificações
│   └── admin/             # Dashboard de admin
├── components/            # Componentes reutilizáveis
│   ├── CreatePostForm.tsx
│   ├── FeedPostCard.tsx
│   ├── ReportButton.tsx
│   └── ...
├── lib/                   # Utilitários
│   └── supabase/         # Clientes Supabase (server e client)
└── middleware.ts         # Proteção de rotas

```

## 🎨 Features Implementadas

- ✅ Login com Google OAuth
- ✅ Dashboard com feed de posts
- ✅ Criar discussões em grupos
- ✅ Upload de imagens em posts
- ✅ Sistema de denúncia/report
- ✅ Badge Premium (UI)
- ✅ Admin dashboard de moderação
- ✅ Botão para contatar moderadores
- ✅ Dark mode com toggle
- ✅ Totalmente responsivo (mobile-first)

## 📝 Licença

MIT

---

**Dúvidas?** Entre em contato ou abra uma issue no repositório!
