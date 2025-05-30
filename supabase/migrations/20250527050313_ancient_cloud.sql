/*
  # TechHelp Platform Schema

  1. New Tables
     - `profiles` - Extended user profile information
     - `financial_transactions` - Financial transactions for FinTech module
     - `medical_appointments` - Medical appointments for HealthTech module
     - `certificate_requests` - Certificate requests for GovTech module
     - `documents` - Document storage across all modules
     - `announcements` - Platform-wide announcements

  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users to access their own data
     - Add admin-specific policies for managing all data
*/

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  transaction_type TEXT NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT,
  transaction_date TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_certificate_url TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  visible_to TEXT[] DEFAULT ARRAY['user', 'admin'],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create views
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  p.id,
  p.full_name,
  p.role,
  (SELECT COUNT(*) FROM financial_transactions ft WHERE ft.user_id = p.id) AS transaction_count,
  (SELECT COUNT(*) FROM medical_appointments ma WHERE ma.user_id = p.id) AS appointment_count,
  (SELECT COUNT(*) FROM certificate_requests cr WHERE cr.user_id = p.id) AS certificate_request_count,
  (SELECT COUNT(*) FROM documents d WHERE d.user_id = p.id) AS document_count
FROM profiles p;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Financial Transactions
CREATE POLICY "Users can view their own transactions"
  ON financial_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON financial_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON financial_transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions"
  ON financial_transactions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Medical Appointments
CREATE POLICY "Users can view their own appointments"
  ON medical_appointments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments"
  ON medical_appointments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON medical_appointments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all appointments"
  ON medical_appointments
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can update all appointments"
  ON medical_appointments
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Certificate Requests
CREATE POLICY "Users can view their own certificate requests"
  ON certificate_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificate requests"
  ON certificate_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all certificate requests"
  ON certificate_requests
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can update all certificate requests"
  ON certificate_requests
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Documents
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all documents"
  ON documents
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can update all documents"
  ON documents
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Announcements
CREATE POLICY "Users can view announcements"
  ON announcements
  FOR SELECT
  USING (
    'user' = ANY(visible_to) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ANY(visible_to)
    )
  );

CREATE POLICY "Admin can create announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can update announcements"
  ON announcements
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', null, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS storage');
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS storage_public');
  
  -- Create financial documents bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('financial_documents', 'financial_documents', FALSE)
  ON CONFLICT DO NOTHING;
  
  -- Create medical documents bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('medical_documents', 'medical_documents', FALSE)
  ON CONFLICT DO NOTHING;
  
  -- Create government documents bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('government_documents', 'government_documents', FALSE)
  ON CONFLICT DO NOTHING;
  
  -- Create profile pictures bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile_pictures', 'profile_pictures', TRUE)
  ON CONFLICT DO NOTHING;
  
  -- Create certificates bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('certificates', 'certificates', FALSE)
  ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Create storage policies
DO $$
BEGIN
  -- Financial documents bucket policies
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'User Documents Policy',
    'financial_documents',
    jsonb_build_object(
      'Resource', 'financial_documents/private/$(auth.uid())/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'user_id', '$(auth.uid())'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  -- Medical documents bucket policies
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'User Medical Documents Policy',
    'medical_documents',
    jsonb_build_object(
      'Resource', 'medical_documents/private/$(auth.uid())/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'user_id', '$(auth.uid())'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  -- Government documents bucket policies
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'User Government Documents Policy',
    'government_documents',
    jsonb_build_object(
      'Resource', 'government_documents/private/$(auth.uid())/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'user_id', '$(auth.uid())'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  -- Admin policies for all buckets
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Admin Financial Documents Policy',
    'financial_documents',
    jsonb_build_object(
      'Resource', 'financial_documents/private/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'role', '"admin"'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Admin Medical Documents Policy',
    'medical_documents',
    jsonb_build_object(
      'Resource', 'medical_documents/private/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'role', '"admin"'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Admin Government Documents Policy',
    'government_documents',
    jsonb_build_object(
      'Resource', 'government_documents/private/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'role', '"admin"'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  -- Profile pictures bucket policies
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Public Profile Pictures Policy',
    'profile_pictures',
    jsonb_build_object(
      'Resource', 'profile_pictures/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ'],
      'Role', 'anon'
    )
  ) ON CONFLICT DO NOTHING;
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'User Profile Pictures Policy',
    'profile_pictures',
    jsonb_build_object(
      'Resource', 'profile_pictures/$(auth.uid())/*',
      'Effect', 'Allow',
      'Action', ARRAY['WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'user_id', '$(auth.uid())'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  -- Certificates bucket policies
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'User Certificates Policy',
    'certificates',
    jsonb_build_object(
      'Resource', 'certificates/private/$(auth.uid())/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'user_id', '$(auth.uid())'
      )
    )
  ) ON CONFLICT DO NOTHING;
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Admin Certificates Policy',
    'certificates',
    jsonb_build_object(
      'Resource', 'certificates/private/*',
      'Effect', 'Allow',
      'Action', ARRAY['READ', 'WRITE'],
      'Role', 'authenticated',
      'Condition', jsonb_build_object(
        'role', '"admin"'
      )
    )
  ) ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;