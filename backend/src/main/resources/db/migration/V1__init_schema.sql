CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_type VARCHAR(20) NOT NULL DEFAULT 'FREE',
    generations_used INTEGER NOT NULL DEFAULT 0,
    generations_limit INTEGER NOT NULL DEFAULT 5,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    brand_voice TEXT,
    brand_industry VARCHAR(255),
    brand_target_audience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    prompt TEXT,
    generated_content TEXT NOT NULL,
    refined_content TEXT,
    score DOUBLE PRECISION,
    feedback TEXT,
    word_count INTEGER,
    character_count INTEGER,
    bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_content_type ON generations(content_type);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);

CREATE TABLE templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,
    example_output TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
