# Blood Bank Management System

A comprehensive blood bank management system built with Next.js and MongoDB.

## Project Overview

This system helps blood banks manage their donations and distributions effectively by tracking donors, blood inventory, and recipients.

## Features

- Donor Management
- Blood Inventory Management
- Recipient Management
- Reports Generation
- Storage Condition Monitoring
- Expiry Tracking
- User Authentication & Role-based Access Control

## Tech Stack

- Next.js
- MongoDB
- NextAuth.js
- Chakra UI
- Chart.js

## Implemented Components

### Authentication & Authorization
- Complete user authentication with NextAuth.js
- Role-based access control (Admin, Manager, Technician, Donor Coordinator, Staff)
- Fine-grained permission system
- Protected routes and API endpoints
- User management interface

### Donor Management
- Donor registration and profiles
- Donor health tracking
- Donation history
- Advanced search and filtering

### Inventory Management
- Blood unit tracking
- Storage management
- Expiry tracking
- Dashboard with statistics

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/mvonombogho/mwm-blood-bank-project.git

# Navigate to the project directory
cd mwm-blood-bank-project

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with the following variables:
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret # Generate a secure random string
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Run the development server
npm run dev
```

### Creating the First Admin User

To set up the first administrator account, you can use the following approach:

1. Start the development server
2. Visit `/auth/register?isAdmin=true` (this special URL bypasses auth checks for the first user only)
3. Create your admin account with full permissions
4. After the first admin is created, all subsequent user management should be done through the admin interface

## Project Structure

```
├── components/          # React components
│   ├── auth/            # Authentication components
│   ├── donors/          # Donor management components
│   ├── inventory/       # Inventory management components
│   └── layout/          # Layout components
├── lib/                 # Utility functions
│   ├── middlewares/     # API middlewares
│   ├── mongodb.js       # MongoDB connection
│   └── apiUtils.js      # API utilities
├── models/              # MongoDB schemas
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── donors/          # Donor management pages
│   ├── inventory/       # Inventory management pages
│   └── _app.js          # App configuration
└── styles/              # Global styles
```

## Author

Mercy Wamaitha Mathu (22/00067)
