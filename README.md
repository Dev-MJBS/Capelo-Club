# LeitoresClub

A full-stack book club forum built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Google OAuth via Supabase.
- **Groups**: Discussion groups for specific books.
- **Threads**: Threaded discussions with replies.
- **Interaction**: Like posts and reply to comments.
- **UI**: Clean, responsive design with Dark/Light mode.

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd leitores-club
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Copy `.env.local.example` (or create `.env.local`) and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Setup Database**:
   - Create a new project in [Supabase](https://supabase.com).
   - Go to the SQL Editor and run the contents of `supabase/schema.sql`.
   - Enable Google Auth Provider in Supabase Authentication settings.

5. **Run Locally**:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy!

### Deploy trigger

Forçar novo deploy: este commit é apenas um trigger para redeploy com `vercel.json` atualizado (`installCommand: npm install --legacy-peer-deps`, `buildCommand: npm run build`).

## Customization

- **Adding Groups**: Currently, groups are seeded via SQL. Add more rows to the `groups` table in Supabase.
- **Admin**: The schema includes basic RLS. Adjust policies in `supabase/schema.sql` for more complex roles.
