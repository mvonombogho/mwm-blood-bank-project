# Blood Bank Management System

A comprehensive blood bank management system built with Next.js and MongoDB.

## Project Overview

This system helps blood banks manage their donations and distributions effectively by tracking donors, blood inventory, and recipients. It provides real-time dashboards, storage condition monitoring, and expiry tracking to ensure efficient management of blood supply.

## Features

- **Blood Inventory Dashboard**
  - Visual overview of current blood supply levels by blood type
  - Critical alerts for low stock or expiring units
  - Visual representations of inventory status

- **Blood Unit Management**
  - Advanced blood unit tracking with detailed information
  - Status management (Available, Reserved, Quarantined, Discarded, Transfused, Expired)
  - Filtering and search capabilities
  - Batch operations for efficient management

- **Storage Management**
  - Storage location and condition tracking
  - Temperature logging and monitoring system
  - Maintenance records tracking
  - Historical temperature data visualization

- **Expiry Tracking**
  - Calendar view of upcoming expirations
  - Notification system for units nearing expiry
  - Expired units management process
  - Batch processing of expired units

- **User Authentication**
  - Role-based access control
  - Protected routes and API endpoints
  - User management interface

- **Donor Management**
  - Donor registration and profiles
  - Donation history tracking
  - Health screening records

- **Recipient Management**
  - Recipient information tracking
  - Transfusion history
  - Medical needs recording

## Tech Stack

- **Frontend**: Next.js, Chakra UI, Chart.js
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB
- Git

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

To set up the first administrator account:

1. Start the development server
2. Visit `/auth/register?isAdmin=true` (this special URL bypasses auth checks for the first user only)
3. Create your admin account with full permissions
4. After the first admin is created, all subsequent user management should be done through the admin interface

## Documentation

The project includes the following documentation:

- [API Documentation](./docs/API.md) - Detailed information about all API endpoints
- [User Guide](./docs/UserGuide.md) - Instructions for using the system
- [Developer Guide](./docs/DeveloperGuide.md) - Information for developers
- [System Architecture](./docs/Architecture.md) - Overview of system design

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
├── styles/              # Global styles
└── docs/                # Documentation
```

## Deployment

The application can be deployed to various platforms:

1. **Vercel**: Recommended for Next.js applications
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Custom Server**: Follow the [Next.js custom server documentation](https://nextjs.org/docs/advanced-features/custom-server)

## Maintenance

Regular maintenance tasks include:

- Database backups (recommended daily)
- System updates (security patches)
- Environment monitoring
- Performance optimization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Mercy Wamaitha Mathu (22/00067) - Bachelor of Science in Information Technology
