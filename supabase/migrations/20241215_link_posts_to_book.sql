-- Add book_of_the_month_id to posts for linking discussions
ALTER TABLE posts ADD COLUMN IF NOT EXISTS book_of_the_month_id uuid REFERENCES book_of_the_month(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_book_month ON posts(book_of_the_month_id);
