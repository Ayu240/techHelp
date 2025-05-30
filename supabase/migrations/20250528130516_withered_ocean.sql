/*
  # Fix Storage Policies

  1. Changes
     - Create storage schema and tables if they don't exist
     - Recreate storage policies with proper structure
     - Ensure proper bucket access control
*/

-- Create storage schema and tables if they don't exist
CREATE SCHEMA IF NOT EXISTS storage;

DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS storage.buckets (
        id text PRIMARY KEY,
        name text NOT NULL,
        owner uuid,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        public boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS storage.objects (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id text,
        name text,
        owner uuid,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        last_accessed_at timestamptz DEFAULT now(),
        metadata jsonb,
        path_tokens text[],
        version text,
        FOREIGN KEY (bucket_id) REFERENCES storage.buckets (id)
    );

    CREATE TABLE IF NOT EXISTS storage.policies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text,
        bucket_id text,
        definition jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        FOREIGN KEY (bucket_id) REFERENCES storage.buckets (id)
    );
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END $$;

-- Recreate buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('profile_pictures', 'profile_pictures', true),
    ('financial_documents', 'financial_documents', false),
    ('medical_documents', 'medical_documents', false),
    ('government_documents', 'government_documents', false),
    ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Recreate policies
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES
    ('Avatar Public Access', 'profile_pictures', 
    '{"Resource": ["*"], "Action": ["SELECT"], "Effect": "Allow", "Role": "anon"}'::jsonb),
    
    ('Avatar Upload Access', 'profile_pictures',
    '{"Resource": ["*"], "Action": ["INSERT", "UPDATE", "DELETE"], "Effect": "Allow", "Role": "authenticated"}'::jsonb),
    
    ('Financial Documents Access', 'financial_documents',
    '{"Resource": ["*"], "Action": ["SELECT", "INSERT", "UPDATE", "DELETE"], "Effect": "Allow", "Role": "authenticated"}'::jsonb),
    
    ('Medical Documents Access', 'medical_documents',
    '{"Resource": ["*"], "Action": ["SELECT", "INSERT", "UPDATE", "DELETE"], "Effect": "Allow", "Role": "authenticated"}'::jsonb),
    
    ('Government Documents Access', 'government_documents',
    '{"Resource": ["*"], "Action": ["SELECT", "INSERT", "UPDATE", "DELETE"], "Effect": "Allow", "Role": "authenticated"}'::jsonb),
    
    ('Certificates Access', 'certificates',
    '{"Resource": ["*"], "Action": ["SELECT", "INSERT", "UPDATE", "DELETE"], "Effect": "Allow", "Role": "authenticated"}'::jsonb)
ON CONFLICT (id) DO NOTHING;