-- Migration: Add pdf_downloadable field to web_blog_posts table
-- Date: 2025-12-19
-- Description: Add field to control if PDF files should be downloadable or view-only

-- Add pdf_downloadable column
ALTER TABLE web_blog_posts
ADD COLUMN pdf_downloadable TINYINT(1) NOT NULL DEFAULT 1
COMMENT '1 if PDF is downloadable, 0 if view-only';