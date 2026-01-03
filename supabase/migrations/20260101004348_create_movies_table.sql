/*
  # Create Movies Library Schema

  1. New Tables
    - `movies`
      - `id` (uuid, primary key) - Unique identifier for each movie
      - `title` (text) - Movie title
      - `description` (text) - Movie description
      - `iframe_url` (text) - ShareCloudy iframe URL
      - `cover_image` (text) - URL to movie cover/poster image
      - `rating` (decimal) - User rating (0-5 stars)
      - `category` (text) - Movie category/genre
      - `tags` (text[]) - Array of custom tags
      - `duration` (text) - Movie duration
      - `year` (integer) - Release year
      - `is_favorite` (boolean) - Favorite flag
      - `view_count` (integer) - Number of times viewed
      - `last_viewed_at` (timestamptz) - Last time the movie was viewed
      - `created_at` (timestamptz) - When the movie was added
      - `updated_at` (timestamptz) - Last update time
      - `user_id` (uuid) - Reference to auth.users (for multi-user support)

  2. Security
    - Enable RLS on `movies` table
    - Add policies for authenticated users to manage their own movies
    - Add policy for public read access (optional for sharing)

  3. Indexes
    - Index on user_id for fast queries
    - Index on category for filtering
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  iframe_url text NOT NULL,
  cover_image text DEFAULT '',
  rating decimal DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  category text DEFAULT 'Uncategorized',
  tags text[] DEFAULT '{}',
  duration text DEFAULT '',
  year integer,
  is_favorite boolean DEFAULT false,
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own movies"
  ON movies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movies"
  ON movies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movies"
  ON movies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movies"
  ON movies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS movies_user_id_idx ON movies(user_id);
CREATE INDEX IF NOT EXISTS movies_category_idx ON movies(category);
CREATE INDEX IF NOT EXISTS movies_created_at_idx ON movies(created_at DESC);
CREATE INDEX IF NOT EXISTS movies_rating_idx ON movies(rating DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_movies_updated_at'
  ) THEN
    CREATE TRIGGER update_movies_updated_at
      BEFORE UPDATE ON movies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;