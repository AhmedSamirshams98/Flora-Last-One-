-- Adds the admin password + authenticator-app fields. Safe to run more than once.
-- Run it on the server BEFORE deploying the code that uses it:
--   psql -U <user> -h localhost <database> -f prisma/manual/2026-11-admin-2fa.sql
-- then `npx prisma generate`.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
  ADD COLUMN IF NOT EXISTS "totpSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "totpEnabled" BOOLEAN NOT NULL DEFAULT false;
