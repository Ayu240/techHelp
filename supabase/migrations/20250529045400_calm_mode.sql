-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Financial Documents Access" ON storage.objects;
DROP POLICY IF EXISTS "Medical Documents Access" ON storage.objects;
DROP POLICY IF EXISTS "Government Documents Access" ON storage.objects;
DROP POLICY IF EXISTS "Certificates Access" ON storage.objects;

-- Create policies on storage.objects table directly
CREATE POLICY "Avatar Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile_pictures');

CREATE POLICY "Avatar Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile_pictures');

CREATE POLICY "Financial Documents Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'financial_documents');

CREATE POLICY "Medical Documents Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'medical_documents');

CREATE POLICY "Government Documents Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'government_documents');

CREATE POLICY "Certificates Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'certificates');