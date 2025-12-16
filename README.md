# Capelo's Club 📚

![Build Status](https://github.com/Dev-MJBS/Capelo-Club/workflows/CI/badge.svg)

**Sua comunidade exclusiva de leitura.**

Capelo's Club é um fórum independente e exclusivo dedicado a leitores apaixonados que querem discutir livros, compartilhar recomendações e descobrir novos mundos literários — longe do barulho das redes sociais abertas.

Aqui não tem algoritmo, não tem post superficial, não tem spam. Só conversa de qualidade entre pessoas que realmente amam ler.

### ✨ Destaques
- **Exclusivo**: Acesso via login (Google, GitHub, X, ou email/senha) – ambiente acolhedor e livre de trolls
- **Focado em discussão profunda**: Threads longas, debates sobre obras, recomendações detalhadas
- **Comentários em tempo real**: Atualizações instantâneas via Supabase Realtime
- **Edição de posts**: Edite seus posts e comentários com histórico de edição
- **Sistema de curtidas**: Curta posts e comentários para destacar conteúdo de qualidade
- **Subclubs**: Crie comunidades temáticas dentro do fórum
- **Independente**: Criado e mantido por uma única pessoa, sem vínculo com editoras
- **Open Source**: Código 100% aberto para contribuir, aprender ou criar seu próprio clube

### 🚀 Status do Projeto
- Lançado em 2025
- Em fase inicial de crescimento
- Totalmente funcional e pronto para receber os primeiros membros

**Link do clube**: https://capelosclub.up.railway.app

### 🛠️ Tech Stack
- **Frontend/Backend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Autenticação**: Supabase Auth (Google, GitHub, X/Twitter OAuth + Email/Password)
- **Banco de dados**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime para comentários
- **State Management**: TanStack Query para cache e infinite scroll
- **Testes**: Jest + Testing Library
- **CI/CD**: GitHub Actions
- **Analytics**: Plausible (privacy-friendly)
- **Hospedagem**: Railway.app

### ✨ Novos Recursos (Dezembro 2025)

#### 🎨 Melhorias de UI/UX
- **Edição de Posts**: Edite posts e comentários inline com indicador "editado"
- **Notificações Toast**: Feedback visual para todas as ações
- **Infinite Scroll**: Carregamento automático de posts ao rolar a página
- **Otimização de Imagens**: Lazy loading e compressão automática
- **Error Boundaries**: Tratamento gracioso de erros com opção de retry

#### 🔐 Autenticação Aprimorada
- **Email/Password**: Cadastro e login com email
- **GitHub OAuth**: Login com conta GitHub
- **Reset de Senha**: Recuperação de senha por email
- **Múltiplos Provedores**: Google, GitHub, X/Twitter, Email

#### 🚀 Performance & Segurança
- **Rate Limiting**: Proteção contra spam (5 posts/hora)
- **Validação de Imagens**: Apenas JPEG/PNG, máximo 5MB
- **Compressão Automática**: Redução de tamanho de imagens
- **Real-time Updates**: Comentários aparecem instantaneamente

#### 🧪 Qualidade de Código
- **Testes Automatizados**: 70% de cobertura de código
- **CI/CD Pipeline**: Testes automáticos em cada commit
- **Componentes Modulares**: Código refatorado e reutilizável
- **TypeScript**: 100% tipado

### 🤝 Como Contribuir
Qualquer ajuda é bem-vinda! Você pode:
- Reportar bugs ou sugerir features (abra uma [Issue](https://github.com/Dev-MJBS/Capelo-Club/issues))
- Enviar Pull Requests (melhorias no código, design, performance, acessibilidade)
- Ajudar na moderação ou criação de conteúdo inicial no fórum
- Divulgar o projeto para leitores que você conhece

**Leia nosso guia**: [CONTRIBUTING.md](CONTRIBUTING.md)  
**Código de Conduta**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

### 📖 Primeiros Passos para Rodar Localmente

#### 1. Clone o repositório
```bash
git clone https://github.com/Dev-MJBS/Capelo-Club.git
cd Capelo-Club
```

#### 2. Instale as dependências
```bash
npm install --legacy-peer-deps
```

#### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase

# Opcional: Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=seu-dominio.com
NEXT_PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io
```

#### 4. Configure o Banco de Dados
- Crie um novo projeto no [Supabase](https://supabase.com)
- Vá até o SQL Editor e rode os arquivos em `supabase/migrations/` em ordem:
  1. `schema.sql` (se for primeira vez)
  2. `20241216_enhance_posts_and_storage.sql`
  3. `20241216_rate_limiting.sql`
- Habilite os provedores de autenticação:
  - Google OAuth
  - GitHub OAuth
  - Email Provider
  - Twitter/X OAuth (opcional)

#### 5. Rode o projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

#### 6. Execute os testes
```bash
# Modo watch
npm test

# Com cobertura
npm run test:ci
```

### 🧪 Testes
O projeto possui testes automatizados com Jest e Testing Library:
- **Unit Tests**: Componentes individuais
- **Integration Tests**: Fluxos de autenticação e CRUD
- **Cobertura**: Mínimo 70%

Execute com: `npm test`

### 📊 Analytics
O projeto usa Plausible Analytics para métricas privacy-friendly:
- Sem cookies
- Sem rastreamento pessoal
- Conformidade com GDPR
- Dashboard público (opcional)

### 🚀 Deploy

#### Railway.app (Recomendado)
1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático em cada push para `main`

#### Vercel
```bash
npm run build
vercel --prod
```

### 📝 Licença
MIT License - veja [LICENSE](LICENSE) para detalhes

### 🙏 Agradecimentos
- [Supabase](https://supabase.com) - Backend as a Service
- [Next.js](https://nextjs.org) - React Framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TanStack Query](https://tanstack.com/query) - Data fetching
- Todos os contribuidores e membros da comunidade!

---

**Feito com ❤️ para leitores apaixonados**
