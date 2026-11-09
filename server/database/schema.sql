-- ====================================================================
-- Sweety – Blood Glucose Tracker
-- Database Schema Definition
-- ====================================================================

-- Ensure pgcrypto extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. Glucose Readings Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS glucose_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_glucose_value CHECK (glucose_value >= 40 AND glucose_value <= 600),
    CONSTRAINT chk_time_slot CHECK (time_slot IN ('MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER')),
    CONSTRAINT uq_user_date_slot UNIQUE (user_id, reading_date, time_slot)
);

-- --------------------------------------------------------------------
-- 3. Database Indexes for Query Optimization
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_readings_user_date ON glucose_readings(user_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_readings_date ON glucose_readings(reading_date);

