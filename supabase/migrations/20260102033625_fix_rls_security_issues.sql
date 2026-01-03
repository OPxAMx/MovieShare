/*
  # Fix RLS Security Issues

  1. Security Improvements
    - Replace auth.uid() with (select auth.uid()) in all RLS policies for better performance
    - This prevents re-evaluation of auth.uid() for each row
    - Fixes suboptimal query performance at scale

  2. Index Cleanup
    - Drop unused indexes on category and rating columns
    - These were not being utilized in queries

  3. Function Improvements
    - Make function search_path immutable for security
*/

DROP POLICY IF EXISTS "Users can view their own movies" ON movies;
DROP POLICY IF EXISTS "Users can insert their own movies" ON movies;
DROP POLICY IF EXISTS "Users can update their own movies" ON movies;
DROP POLICY IF EXISTS "Users can delete their own movies" ON movies;

CREATE POLICY "Users can view their own movies"
  ON movies FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own movies"
  ON movies FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own movies"
  ON movies FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own movies"
  ON movies FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP INDEX IF EXISTS movies_category_idx;
DROP INDEX IF EXISTS movies_rating_idx;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_movies_updated_at'
  ) THEN
    DROP TRIGGER update_movies_updated_at ON movies;
  END IF;
END $$;

DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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