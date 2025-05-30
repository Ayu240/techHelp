-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can update announcements" ON announcements;

-- Create new non-recursive policies
CREATE POLICY "Users can view profiles"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Everyone can view announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own announcements"
  ON announcements
  FOR SELECT
  USING (auth.uid() = created_by);

-- Update storage policies to be non-recursive
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile_pictures');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('profile_pictures', 'financial_documents', 'medical_documents', 'government_documents', 'certificates'));