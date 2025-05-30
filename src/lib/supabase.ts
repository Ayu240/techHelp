import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rguczrhrdvzxqdcuthsu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWN6cmhyZHZ6eHFkY3V0aHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjA0ODEsImV4cCI6MjA2Mzg5NjQ4MX0.IY366x9ipCQvvnqFbNUy24El9LDC3bmdEmbC-MXsVk4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export type FinancialTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  payment_method: string;
  transaction_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type MedicalAppointment = {
  id: string;
  user_id: string;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CertificateRequest = {
  id: string;
  user_id: string;
  certificate_type: string;
  purpose: string | null;
  status: 'pending' | 'approved' | 'rejected';
  issued_certificate_url: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Document = {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: string;
  category: 'financial' | 'medical' | 'government';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export type Announcement = {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'financial' | 'medical' | 'government';
  created_at: string;
  updated_at: string;
}