-- Improve handle_new_user to be more robust and prevent server_error on login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_val TEXT;
    base_username TEXT;
    image_url TEXT;
    full_name_val TEXT;
    retry_count INTEGER := 0;
    max_retries INTEGER := 5;
    done BOOLEAN := FALSE;
BEGIN
    -- 1. Get base info
    base_username := SPLIT_PART(NEW.email, '@', 1);
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
    
    IF base_username = '' OR base_username IS NULL THEN
        base_username := 'leitor';
    END IF;

    -- 2. Detail gathering
    image_url := NEW.raw_user_meta_data->>'avatar_url';
    IF image_url IS NULL THEN
       image_url := NEW.raw_user_meta_data->>'picture';
    END IF;

    full_name_val := NEW.raw_user_meta_data->>'full_name';
    IF full_name_val IS NULL THEN
        full_name_val := NEW.raw_user_meta_data->>'name';
    END IF;

    -- 3. Robust insert with username collision handling
    WHILE NOT done AND retry_count < max_retries LOOP
        BEGIN
            -- Generate username (more unique)
            IF retry_count = 0 THEN
                username_val := base_username || floor(random() * 9000 + 1000)::text;
            ELSE
                username_val := base_username || floor(random() * 900000 + 100000)::text;
            END IF;

            INSERT INTO public.profiles (id, username, full_name, avatar_url)
            VALUES (
                NEW.id, 
                username_val, 
                full_name_val, 
                image_url
            )
            ON CONFLICT (id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                avatar_url = EXCLUDED.avatar_url;
            
            done := TRUE;
        EXCEPTION 
            WHEN unique_violation THEN
                -- If the error is about ID, it's already handled by ON CONFLICT
                -- If it's about username, we retry
                IF retry_count < max_retries - 1 THEN
                    retry_count := retry_count + 1;
                ELSE
                    -- Last resort: unique suffix
                    username_val := base_username || '_' || extract(epoch from now())::text;
                    INSERT INTO public.profiles (id, username, full_name, avatar_url)
                    VALUES (NEW.id, username_val, full_name_val, image_url)
                    ON CONFLICT (id) DO UPDATE SET
                        full_name = EXCLUDED.full_name,
                        avatar_url = EXCLUDED.avatar_url;
                    done := TRUE;
                END IF;
            WHEN OTHERS THEN
                -- Catch-all to prevent failing the entire user creation
                -- Return NEW to allow GoTrue to continue
                RAISE NOTICE 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
                RETURN NEW;
        END;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
