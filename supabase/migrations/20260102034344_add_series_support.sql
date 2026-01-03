/*
  # Add TV Series Support

  1. Schema Changes
    - Add content_type column (film or series)
    - Add episodes column (JSON array with episode data)
    - Default existing movies to 'film' type

  2. Migration Details
    - content_type: 'film' | 'series'
    - episodes: array of {name: string, url: string}
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'movies' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE movies ADD COLUMN content_type text DEFAULT 'film' CHECK (content_type IN ('film', 'series'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'movies' AND column_name = 'episodes'
  ) THEN
    ALTER TABLE movies ADD COLUMN episodes jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;