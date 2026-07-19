# Educational Portal Frontend System

A modern responsive school/madrasa educational portal built with Next.js, React, and Tailwind CSS. The system includes a public landing page, role-based login, Admin dashboard, Student dashboard, student registration, class management, subject management, fee ledger, examination entry, recorded exam registry, and student result marksheet display.

## Features

- **Public Landing Page**: Clean responsive hero page, language localization dropdown (English, Arabic, Somali), light/dark mode switch, and interactive school highlights.
- **Role-Based Authentication**: Custom sign-in routes for Administrators and Students.
- **Admin Dashboard**:
  - Student Registration (Registration of name, email, academic year, and grade group).
  - Searchable, sortable, and paginated student directory.
  - Class Management (Add, edit, or delete classrooms and instructors).
  - Subject Registry (Assign name, course code, and description).
  - Fee Management (Assign fees individually or to entire classes, record transactions, apply credit deductions, and export statements to Excel/CSV).
  - Exam Entry System (Bulk exam entries with subject grade inputs, maximum points threshold, term selection, and feedback notes).
  - Exam History Registry (Registry of all recorded grades, searchable by student, and supporting record deletions).
- **Student Dashboard**:
  - Personal details view.
  - Interactive Fee Ledger showing total charges, payments made, deductions applied, and outstanding status.
  - Complete Term Report Marksheet showing raw subject scores, percentages, averages, and calculated grades.
- **Local Storage State Persistence**: Offline-first, fully client-side persistent storage using browser `localStorage`.
- **RTL Language Support**: Seamless layout switching for right-to-left layout when Arabic language is selected.
- **Beautiful Dark Mode**: Styled in custom HSL glassmorphism palettes and dynamic animations (framer-motion).

## Tech Stack

- **Core Framework**: Next.js (App Router)
- **Library**: React.js
- **Styling**: Tailwind CSS, CSS Variables
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Persistence**: Browser `localStorage` (No database or server-side API required)

## Pages and Routes

- `/` - Public Landing Page
- `/login` - Role-selection and Login Page
- `/admin` - Administrator Dashboard
- `/student` - Student Portal Dashboard

## Admin Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Student Login Rules

Students can log in to their dashboard using:
1. **Student ID** (e.g., `STU-1001`)
2. **Student Name** (e.g., `Ahmed Ali`)

*New student credentials are automatically generated upon registration by an administrator in the system (e.g., incrementing ID as `STU-1003`, `STU-1004` etc.).*

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Run Locally

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

Compile the production bundle:
```bash
npm run build
```

## Project Structure

```
├── public/              # Static assets and icons
├── src/
│   ├── app/             # App router pages & layouts
│   │   ├── admin/       # Administrator dashboard route
│   │   ├── login/       # Login interface route
│   │   ├── student/     # Student portal dashboard route
│   │   ├── layout.tsx   # Global template layout
│   │   ├── globals.css  # CSS custom stylesheet & design tokens
│   │   └── page.tsx     # Landing page file
│   ├── components/      # Shared components (Logo, loader, etc.)
│   ├── context/         # Application state providers
│   │   ├── PortalContext.tsx  # Central local persistence & context provider
│   │   ├── ToastContext.tsx   # Toast notification state system
│   │   └── translations.ts    # Localization translation registry
│   └── lib/             # Utility helpers
├── package.json         # Project manifests and scripts
└── tsconfig.json        # TypeScript configuration options
```

## Notes

- This project is a **frontend-only** implementation utilizing state persistent React hooks and local storage synchronization.
- There are **no external database connections or backend requirements**.
- All styling is optimized with Tailwind CSS utility classes and framer-motion micro-animations.
