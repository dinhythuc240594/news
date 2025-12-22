-- Migration: Add news_international_id column to viewed_news and comments tables
-- This allows viewed_news and comments to reference both News and NewsInternational tables

-- ============================================
-- VIEWED_NEWS TABLE
-- ============================================

-- Add the new column (nullable initially)
ALTER TABLE viewed_news 
ADD COLUMN IF NOT EXISTS news_international_id INTEGER;

-- Add foreign key constraint
ALTER TABLE viewed_news 
ADD CONSTRAINT fk_viewed_news_news_international 
FOREIGN KEY (news_international_id) 
REFERENCES news_international(id) 
ON DELETE CASCADE;

-- Make news_id nullable to support both news and news_international
ALTER TABLE viewed_news 
ALTER COLUMN news_id DROP NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_viewed_news_news_international_id 
ON viewed_news(news_international_id);

-- Add check constraint to ensure at least one of news_id or news_international_id is not null
ALTER TABLE viewed_news 
ADD CONSTRAINT chk_viewed_news_has_news 
CHECK (news_id IS NOT NULL OR news_international_id IS NOT NULL);

-- ============================================
-- COMMENTS TABLE
-- ============================================

-- Add the new column (nullable initially)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS news_international_id INTEGER;

-- Add foreign key constraint
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_news_international 
FOREIGN KEY (news_international_id) 
REFERENCES news_international(id) 
ON DELETE CASCADE;

-- Make news_id nullable to support both news and news_international
ALTER TABLE comments 
ALTER COLUMN news_id DROP NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_news_international_id 
ON comments(news_international_id);

-- Add check constraint to ensure at least one of news_id or news_international_id is not null
ALTER TABLE comments 
ADD CONSTRAINT chk_comments_has_news 
CHECK (news_id IS NOT NULL OR news_international_id IS NOT NULL);

