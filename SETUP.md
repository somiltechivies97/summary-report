# Setup Instructions

## Prerequisites
- Node.js and npm installed
- Supabase account

## Step 1: Environment Configuration

1. Copy the `.env.example` file to `.env`
2. Update the environment file with your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can find these values in your Supabase project settings under API.

## Step 2: Update Environment File

Edit `src/environments/environment.ts` and add your Supabase credentials:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

## Step 3: Seed the Database

The database has been set up with the following tables:
- `categories` - Contains product categories
- `items` - Contains product items with details

To seed the database with initial data, you can use the Supabase SQL editor to run the following:

```sql
-- Insert categories
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

-- You can then add items using the application's "Create New Item" button
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Application

```bash
npm start
```

The application will be available at `http://localhost:4200`

## Features

### Item Management
- **View Items**: Browse all items with filtering by category and search by name
- **Create Item**: Click "Create New Item" to add a new product
- **Edit Item**: Click "Edit" button on any item to modify its details
- **Delete Item**: Click "Delete" button to remove an item (with confirmation)

### Form Fields
- **Name** (required): Product name
- **Category** (required): Select from available categories
- **MRP**: Maximum Retail Price
- **Price**: Selling price
- **Sequence**: Display order (lower numbers appear first)

All data is stored in Supabase and persists across sessions.
