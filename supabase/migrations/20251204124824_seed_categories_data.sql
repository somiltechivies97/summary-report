/*
  # Seed Categories Data

  1. Purpose
    - Populate the categories table with initial data
    - Ensure categories are available for item assignment

  2. Categories Added
    - POPCORN (Sequence: 1)
    - FRYUMS (Sequence: 2)
    - NAMKEEN (Sequence: 3)
    - NAMKEEN_12 (Sequence: 4)
    - CHATAKA_DHAMAKA (Sequence: 5)
    - WAFERS (Sequence: 6)
    - WAFER_BISCUIT (Sequence: 7)
    - 400GM (Sequence: 8)
    - 200GM (Sequence: 9)
    - CHIKKI (Sequence: 10)
    - PAPAD (Sequence: 11)
    - SWEET_ROLL (Sequence: 12)
    - MUNCHI_ROLL (Sequence: 13)
    - DERBY_JAR (Sequence: 14)
    - DERBY_POUCH (Sequence: 15)
    - 1KG (Sequence: 16)
    - ADVERTISING_MATERIAL (Sequence: 17)
    - REAL_BITES (Sequence: 18)

  3. Important Notes
    - Uses ON CONFLICT to prevent duplicate entries
    - Categories are ordered by sequence number
*/

INSERT INTO categories (name, sequence) VALUES
  ('POPCORN', 1),
  ('FRYUMS', 2),
  ('NAMKEEN', 3),
  ('NAMKEEN_12', 4),
  ('CHATAKA_DHAMAKA', 5),
  ('WAFERS', 6),
  ('WAFER_BISCUIT', 7),
  ('400GM', 8),
  ('200GM', 9),
  ('CHIKKI', 10),
  ('PAPAD', 11),
  ('SWEET_ROLL', 12),
  ('MUNCHI_ROLL', 13),
  ('DERBY_JAR', 14),
  ('DERBY_POUCH', 15),
  ('1KG', 16),
  ('ADVERTISING_MATERIAL', 17),
  ('REAL_BITES', 18)
ON CONFLICT (name) DO NOTHING;