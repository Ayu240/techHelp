-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Everyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view own announcements" ON announcements;

-- Create simplified policies
CREATE POLICY "Allow individual access"
  ON profiles
  FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated access"
  ON financial_transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow medical access"
  ON medical_appointments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow certificate access"
  ON certificate_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow document access"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow announcement access"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;