-- Add qr_code_id column to albums table
-- Run this in your Supabase SQL Editor

ALTER TABLE albums
ADD COLUMN IF NOT EXISTS qr_code_id TEXT UNIQUE;

-- Generate unique qr_code_id for existing rows that don't have one
DO $$
DECLARE
  rec RECORD;
  new_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  id_exists BOOLEAN;
BEGIN
  FOR rec IN SELECT id FROM albums WHERE qr_code_id IS NULL OR qr_code_id = '' LOOP
    LOOP
      new_id := '';
      FOR i IN 1..10 LOOP
        new_id := new_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
      END LOOP;
      SELECT EXISTS(SELECT 1 FROM albums WHERE qr_code_id = new_id) INTO id_exists;
      EXIT WHEN NOT id_exists;
    END LOOP;
    UPDATE albums SET qr_code_id = new_id, qr_code = '/album/' || new_id WHERE id = rec.id;
  END LOOP;
END $$;

-- Make qr_code_id NOT NULL after backfill
ALTER TABLE albums
ALTER COLUMN qr_code_id SET NOT NULL;

-- Add index for faster lookups by qr_code_id
CREATE INDEX IF NOT EXISTS idx_albums_qr_code_id ON albums (qr_code_id);
