/*
  # Create Items and Categories Tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key) - Unique identifier for each category
      - `name` (text, unique, not null) - Category name
      - `sequence` (integer, not null) - Display order sequence
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
    
    - `items`
      - `id` (uuid, primary key) - Unique identifier for each item
      - `name` (text, not null) - Item name
      - `code` (text) - Item code (optional)
      - `category` (text, not null) - Category name
      - `mrp` (numeric, default 0) - Maximum retail price
      - `price` (numeric, default 0) - Selling price
      - `sequence` (integer, default 999) - Display order within category
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (since this is a catalog/inventory app)
    - Add policies for authenticated users to insert/update/delete

  3. Important Notes
    - Categories are referenced by name in items table for flexibility
    - Sequence numbers control display order
    - Public read access allows the app to function without authentication
    - Write operations could be restricted to authenticated users in production
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  sequence integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text DEFAULT '',
  category text NOT NULL,
  mrp numeric DEFAULT 0,
  price numeric DEFAULT 0,
  sequence integer DEFAULT 999,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Categories policies - allow public read, anyone can manage for now
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert categories"
  ON categories
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
  ON categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete categories"
  ON categories
  FOR DELETE
  USING (true);

-- Items policies - allow public read, anyone can manage for now
CREATE POLICY "Anyone can read items"
  ON items
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert items"
  ON items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update items"
  ON items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete items"
  ON items
  FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_sequence ON items(sequence);
CREATE INDEX IF NOT EXISTS idx_categories_sequence ON categories(sequence);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();