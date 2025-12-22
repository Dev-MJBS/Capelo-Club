-- Rename openlibrary_key to google_id as we switched to Google Books API
ALTER TABLE book_of_the_month RENAME COLUMN openlibrary_key TO google_id;
ALTER TABLE monthly_nominations RENAME COLUMN openlibrary_key TO google_id;

-- The unique constraint index is automatically renamed by Postgres for the column, 
-- but we might want to keep the name generic or explicit if needed.
-- However, just renaming the column is sufficient for the application to work with the new names.
