-- Migration: Add email verification columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verify_token   VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS token_expires  DATETIME NULL;

-- Mark existing users as already verified so they are not locked out
UPDATE users SET email_verified = 1 WHERE email_verified = 0;
