# techHelp Platform

Unified Citizen Support Platform for managing finances, healthcare, government services, and documents in one place.

**Live Demo:** [https://techhelpers.netlify.app/](https://techhelpers.netlify.app/)

---

## Features

### Unified Dashboard
- Access all your essential services from a single, intuitive dashboard interface.

### Financial Management
- Track expenses and incomes.
- Manage budgets and view transaction history.
- Upload and securely store financial documents (PDF, images, DOCX).
- Download and delete uploaded financial documents.

### Healthcare Access
- Book and manage medical appointments.
- View upcoming and past appointments.
- Upload and securely store medical documents (PDF, images, DOCX).
- Download and delete uploaded medical documents.

### Government Services
- Request government certificates (e.g., birth, marriage, etc.).
- Track the status of certificate requests.
- Upload and securely store government-related documents.
- Download and delete uploaded government documents.
- **Admins:** Approve, reject, and upload certificates for requests.

### Document Management
- Centralized page to view, filter, download, and delete all uploaded documents by category (financial, medical, government).
- Document verification status (Verified / Pending Verification).

### Announcements
- Platform-wide announcements visible to users and admins.
- Real-time updates for new announcements.
- **Admins:** Create and manage announcements with category and visibility controls.

### Authentication & Profile
- Secure registration and login with email verification.
- Profile management: update name, phone, address, date of birth, and avatar.
- Email verification status display.

### Responsive UI
- Modern, responsive design using Tailwind CSS.
- Accessible and mobile-friendly layouts for all pages.

### Real-time Updates
- Live updates for announcements and document changes using Supabase channels.

### Security
- Role-based access control for users and admins.
- Row Level Security (RLS) on all sensitive tables.
- Secure file storage with access policies.

---

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Run the development server**
   ```sh
   npm run dev
   ```

3. **Build for production**
   ```sh
   npm run build
   ```

---

## Tech Stack

- React + TypeScript
- Supabase (Database, Auth, Storage, Realtime)
- Tailwind CSS
- Vite

---

&copy; 2025 techHelp. All rights reserved.