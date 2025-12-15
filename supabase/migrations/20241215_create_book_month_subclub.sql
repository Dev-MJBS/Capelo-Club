-- Create "Livro do Mês" official subclub
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Find an admin user to be the owner (or just the first user if no admin)
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;
    
    -- If no admin, just pick any user (fallback)
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM profiles LIMIT 1;
    END IF;

    IF admin_id IS NOT NULL THEN
        INSERT INTO subclubs (name, display_name, description, rules, owner_id, is_official, banner_url)
        VALUES (
            'livro-do-mes',
            'Livro do Mês',
            'Discussões oficiais sobre o Livro do Mês do Capelo Club.',
            'Respeite as opiniões e evite spoilers sem aviso.',
            admin_id,
            true,
            'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2940&auto=format&fit=crop'
        )
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;
