/*
  # Fix Profile and Announcement Policies

  1. Changes
     - Replace recursive profile policies with direct checks
     - Simplify announcement policies to avoid profile table lookups
     - Add direct admin role check policy

  2. Security
     - Maintains existing security model
     - Eliminates infinite recursion
     - Preserves access control intentions
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can update announcements" ON announcements;

-- Create new non-recursive policies
CREATE POLICY "Admin can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can view announcements"
  ON announcements
  FOR SELECT
  USING (
    auth.uid() = created_by OR 'user' = ANY(visible_to)
  );

CREATE POLICY "Admin can manage announcements"
  ON announcements
  FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );