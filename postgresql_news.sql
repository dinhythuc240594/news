-- Database: newsdb

DROP DATABASE IF EXISTS newsdb;

CREATE DATABASE newsdb
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    order_display INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES categories(id),
    visible BOOLEAN DEFAULT TRUE,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'editor', 'user'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    thumbnail VARCHAR(255),
    images TEXT, -- JSON array of image URLs
    
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending', 'published', 'hidden', 'rejected'
    is_featured BOOLEAN DEFAULT FALSE,
    is_hot BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(255),
    
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news_tags (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(news_id, tag_id)
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_created_at ON news(created_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_published_at ON news(published_at DESC);

-- Index cho tìm kiếm full-text (PostgreSQL)
-- CREATE INDEX idx_news_title_search ON news USING gin(to_tsvector("vietnamese", title));
-- CREATE INDEX idx_news_content_search ON news USING gin(to_tsvector("vietnamese", content));

-- Index cho categories
-- CREATE INDEX idx_categories_slug ON categories(slug);
-- CREATE INDEX idx_categories_parent ON categories(parent_id);

-- News Status
CREATE TYPE news_status AS ENUM ('draft', 'pending', 'published', 'hidden', 'rejected');

-- User Role
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'user');


-- 2. Tạo bảng saved_news (tin đã lưu)
CREATE TABLE IF NOT EXISTS saved_news (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, news_id)
);

-- 3. Tạo bảng viewed_news (tin đã xem)
CREATE TABLE IF NOT EXISTS viewed_news (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, news_id)
);

-- 4. Tạo bảng comments (bình luận)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tạo index cho hiệu suất
CREATE INDEX IF NOT EXISTS idx_saved_news_user ON saved_news(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_news_news ON saved_news(news_id);
CREATE INDEX IF NOT EXISTS idx_viewed_news_user ON viewed_news(user_id);
CREATE INDEX IF NOT EXISTS idx_viewed_news_news ON viewed_news(news_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_news ON comments(news_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

CREATE TABLE IF NOT EXISTS news_international (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    thumbnail VARCHAR(255),
    images TEXT, -- JSON array of image URLs
    
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending', 'published', 'hidden', 'rejected'
    is_featured BOOLEAN DEFAULT FALSE,
    is_hot BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(255),
    language VARCHAR(20) DEFAULT 'english',
    source VARCHAR(255),
    source_url VARCHAR(255),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories_international (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    language VARCHAR(20) DEFAULT 'english',
    order_display INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES categories(id),
    visible BOOLEAN DEFAULT TRUE,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);