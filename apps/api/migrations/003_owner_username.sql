-- Add the Better Auth username fields. Existing owners set their username through local setup.
ALTER TABLE "user"
  ADD COLUMN username text UNIQUE,
  ADD COLUMN "displayUsername" text;
