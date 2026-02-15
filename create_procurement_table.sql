-- SQL Script: Create procurement_announcements table
-- Run this script directly in your MySQL database

CREATE TABLE IF NOT EXISTS procurement_announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    announcement_date DATE NOT NULL,
    year INT NOT NULL,
    file_url VARCHAR(500),
    external_url VARCHAR(500),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_is_active (is_active),
    INDEX idx_announcement_date (announcement_date)
);

-- Verify table was created
SHOW TABLES LIKE 'procurement_announcements';

-- Check table structure
DESCRIBE procurement_announcements;
