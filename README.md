# Capelo's Club 📚

**Sua comunidade exclusiva de leitura.**

Capelo's Club é um fórum independente e exclusivo dedicado a leitores apaixonados que querem discutir livros, compartilhar recomendações e descobrir novos mundos literários — longe do barulho das redes sociais abertas.

Aqui não tem algoritmo, não tem post superficial, não tem spam. Só conversa de qualidade entre pessoas que realmente amam ler.

### ✨ Destaques
- **Exclusivo**: Acesso apenas via login (Google ou X) – cria um ambiente mais acolhedor e livre de trolls.
- **Focado em discussão profunda**: Threads longas, debates sobre obras, recomendações detalhadas e conexões reais entre membros.
- **Independente**: Criado e mantido por uma única pessoa, sem vínculo com editoras ou grandes plataformas.
- **Open Source**: Código 100% aberto para quem quiser contribuir, aprender ou até criar o próprio clube.

### 🚀 Status do Projeto
- Lançado em 2025
- Em fase inicial de crescimento
- Totalmente funcional e pronto para receber os primeiros membros

**Link do clube**: https://capelosclub.up.railway.app

### 🛠️ Tech Stack
- **Frontend/Backend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Autenticação**: Supabase Auth (Google OAuth + X/Twitter OAuth)
- **Banco de dados**: Supabase (PostgreSQL)
- **Hospedagem**: Railway.app
- **Deploy**: Contínuo via GitHub + Railway

### 🤝 Como Contribuir
Qualquer ajuda é bem-vinda! Você pode:
- Reportar bugs ou sugerir features (abra uma Issue)
- Enviar Pull Requests (melhorias no código, design, performance, acessibilidade)
- Ajudar na moderação ou criação de conteúdo inicial no fórum
- Divulgar o projeto para leitores que você conhece

**Regras básicas para contribuição**:
- Siga o Código de Conduta (em breve)
- Mantenha o foco na experiência do usuário leitor
- Respeite a simplicidade do projeto – queremos algo leve e rápido

### 📖 Primeiros Passos para Rodar Localmente
1. Clone o repositório:
   ```bash
   git clone https://github.com/Dev-MJBS/Capelo-Club.git
   cd Capelo-Club
   ```

2. Instale as dependências:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure as Variáveis de Ambiente:
   Crie um arquivo `.env.local` na raiz do projeto e adicione suas chaves do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
   ```

4. Configure o Banco de Dados:
   - Crie um novo projeto no [Supabase](https://supabase.com).
   - Vá até o SQL Editor e rode o conteúdo dos arquivos na pasta `supabase/migrations/` ou `supabase/schema.sql`.
   - Habilite o Google Auth Provider nas configurações de Autenticação do Supabase.

5. Rode o projeto:
   ```bash
   npm run dev
   ```
