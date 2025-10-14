# Chama Management System

A modern digital platform for managing Chama (savings groups) in Kenya. Built with Next.js, React Native, and MongoDB.

## Features

- **Member Management**: Add, edit, and manage chama members
- **Contribution Tracking**: Record and track monthly contributions
- **Loan Management**: Handle loan requests, approvals, and repayments
- **Financial Dashboard**: View group financial overview and reports
- **Role-Based Access**: Separate interfaces for admins and members
- **Mobile & Web**: Native mobile app for members, web dashboard for admins

## Tech Stack

- **Admin Web App**: Next.js 14, TypeScript, Tailwind CSS
- **Mobile App**: React Native (Expo)
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js

## Project Structure

```
chama-app/
├── apps/
│   ├── admin/          # Next.js admin dashboard
│   └── mobile/         # React Native mobile app
├── packages/
│   ├── database/       # MongoDB schemas and connection
│   └── shared/         # Shared types and utilities
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the admin app
   - Add your MongoDB Atlas connection string

4. Run the development servers:
   ```bash
   # Admin dashboard
   npm run dev:admin

   # Mobile app
   npm run dev:mobile
   ```

## MVP Roadmap

- [x] Project setup
- [ ] Database schema
- [ ] Authentication system
- [ ] Member management
- [ ] Contribution tracking
- [ ] Loan management
- [ ] Dashboard & reports

## License

MIT
