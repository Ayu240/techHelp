/*
  # Fix Storage Policies and Create Admin User

  1. Storage Policies
     - Simplify storage policies to fix upload issues
     - Add public access for profile pictures
     - Fix document upload permissions

  2. Admin User
     - Create admin user with specified credentials
*/

-- Fix storage policies
DO $$
BEGIN
  -- Update profile pictures bucket policies
  DELETE FROM storage.policies WHERE bucket_id = 'profile_pictures';
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Avatar Public Access',
    'profile_pictures',
    jsonb_build_object(
      'Resource', array['*'],
      'Action', array['SELECT'],
      'Effect', 'Allow',
      'Role', 'anon'
    )
  );

  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Avatar Upload Access',
    'profile_pictures',
    jsonb_build_object(
      'Resource', array['*'],
      'Action', array['INSERT', 'UPDATE', 'DELETE'],
      'Effect', 'Allow',
      'Role', 'authenticated'
    )
  );

  -- Update document storage policies
  DELETE FROM storage.policies 
  WHERE bucket_id IN ('financial_documents', 'medical_documents', 'government_documents');

  -- Financial documents
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Financial Documents Access',
    'financial_documents',
    jsonb_build_object(
      'Resource', array['*'],
      'Action', array['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Effect', 'Allow',
      'Role', 'authenticated'
    )
  );

  -- Medical documents
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Medical Documents Access',
    'medical_documents',
    jsonb_build_object(
      'Resource', array['*'],
      'Action', array['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Effect', 'Allow',
      'Role', 'authenticated'
    )
  );

  -- Government documents
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Government Documents Access',
    'government_documents',
    jsonb_build_object(
      'Resource', array['*'],
      'Action', array['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Effect', 'Allow',
      'Role', 'authenticated'
    )
  );
END $$;

-- Create admin user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'av609497@gmail.com',
    crypt('123456789', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Update profile to admin role
  UPDATE profiles
  SET role = 'admin'
  WHERE id = new_user_id;
END $$;