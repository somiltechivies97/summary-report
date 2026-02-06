/*
  # Add Purchase and Sale Columns to Items

  1. New Columns
    - `purchase` (numeric, not null, default 0) - Purchase/cost price
    - `sale` (numeric, not null, default 0) - Sale price
    - Make `sequence` NOT NULL with default value

  2. Changes
    - Added purchase column for cost tracking
    - Added sale column for selling price
    - Made sequence column required with default 999
    - All new fields default to 0 for safe insertion

  3. Important Notes
    - Existing items will have purchase and sale values set to 0
    - Sequence is now required for all items
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'purchase'
  ) THEN
    ALTER TABLE items ADD COLUMN purchase numeric DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'sale'
  ) THEN
    ALTER TABLE items ADD COLUMN sale numeric DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'sequence'
  ) THEN
    ALTER TABLE items ADD COLUMN sequence integer NOT NULL DEFAULT 999;
  ELSE
    ALTER TABLE items ALTER COLUMN sequence SET NOT NULL;
    ALTER TABLE items ALTER COLUMN sequence SET DEFAULT 999;
  END IF;
END $$;