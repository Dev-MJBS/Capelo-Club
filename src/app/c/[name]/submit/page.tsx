

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SubclubPostForm from '@/components/SubclubPostForm'

// Using async component pattern for App Router params in client component is tricky without wrapping.
// Actually standard client components receive params as props directly in Page? No, params is Promise in recent Next.
// Better: make this a Client Component that takes params as props from a Server Component parent OR use React.use() to unwrap params?
// In Next.js 15, params is a promise.
// Let's make the Page server side and the Form client side.

export default async function SubmitPostPage(props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const { name } = params
    const supabase = await createClient()

    const { data: subclub } = await (supabase
        .from('subclubs') as any)
        .select('id, name, display_name')
        .eq('name', name)
        .single()

    if (!subclub) notFound()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <SubclubPostForm subclubName={subclub.name} subclubId={subclub.id} />
            </div>
        </div>
    )
}

// ... wait, I will rewrite this file to be cleaner.
// I will create `src/app/c/[name]/submit/page.tsx` as 'use client' and use `useParams`.
