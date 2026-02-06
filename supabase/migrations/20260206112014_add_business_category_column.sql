/*
  # Add Business Category Column to Items

  1. New Column
    - `business_category` (text, not null, default '') - Business category for item classification

  2. Changes
    - Added business_category column to items table
    - Default value is empty string for safe insertion

  3. Important Notes
    - Existing items will have business_category set to empty string
    - This field is used to categorize items by business unit or type
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'business_category'
  ) THEN
    ALTER TABLE items ADD COLUMN business_category text NOT NULL DEFAULT '';
  END IF;
END $$;