# School Management System

A comprehensive Next.js-based School Management System with multiple modules for managing students, teachers, attendance, fees, exams, and more.

## Features

- 🎓 **Student Management** - Complete student lifecycle management
- 👨‍🏫 **Teacher & Staff Management** - Staff records and assignments
- 📅 **Attendance System** - Daily attendance tracking
- 💰 **Fees & Finance** - Fee collection and financial management
- 📝 **Exam & Results** - Exam scheduling and result management
- 📚 **Library Management** - Book catalog and issue tracking
- 🚌 **Transport Management** - Route and vehicle management
- 💬 **Communication** - Announcements and messaging
- 📊 **Reports & Analytics** - Comprehensive reporting dashboard

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM
- **Authentication**: JWT with role-based access control

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SchoolManagmentSystem
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` and update the database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/school_management?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
```

4. Set up database:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database with initial data
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Default Login

After setting up the database, you'll need to create an admin user. You can do this through:
- Prisma Studio: `npx prisma studio`
- API endpoint: `POST /api/auth/register` (if implemented)
- Database seed script

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── prisma/                 # Database schema and migrations
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## License

MIT

