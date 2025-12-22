-- Migration: Add news_international_id column to saved_news table
-- This allows saved_news to reference both News and NewsInternational tables

-- Add the new column (nullable initially)
ALTER TABLE saved_news 
ADD COLUMN IF NOT EXISTS news_international_id INTEGER;

-- Add foreign key constraint
ALTER TABLE saved_news 
ADD CONSTRAINT fk_saved_news_news_international 
FOREIGN KEY (news_international_id) 
REFERENCES news_international(id) 
ON DELETE CASCADE;

-- Make news_id nullable to support both news and news_international
ALTER TABLE saved_news 
ALTER COLUMN news_id DROP NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_news_news_international_id 
ON saved_news(news_international_id);

-- Add check constraint to ensure at least one of news_id or news_international_id is not null
ALTER TABLE saved_news 
ADD CONSTRAINT chk_saved_news_has_news 
CHECK (news_id IS NOT NULL OR news_international_id IS NOT NULL);

