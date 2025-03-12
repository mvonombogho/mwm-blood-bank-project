# Blood Bank Management System

A comprehensive system designed to help blood banks manage their donations and distributions effectively. This system tracks donors, blood inventory, and recipients in a simple and organized way.

## Features

- **Donor Management:** Store donor information, track blood type, and record donation history
- **Blood Inventory:** Track blood units, monitor expiry dates, and manage storage locations
- **Recipient Management:** Manage recipient information and transfusion records
- **Reports:** Generate insights on blood stock, donation history, and transfusion records

## Technology Stack

- **Next.js:** React framework for server-side rendering and static site generation
- **MongoDB:** NoSQL database for flexible schema design and scalability
- **NextAuth.js:** Authentication solution for Next.js applications

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mvonombogho/mwm-blood-bank-project.git
   cd mwm-blood-bank-project
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   - Copy the `.env.local` template
   - Update the MongoDB connection string with your credentials
   - Set up NextAuth secret key
   - Make sure to set a secure REGISTRATION_SECRET value

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at [http://localhost:3000](http://localhost:3000)

### First-Time Setup: Creating an Admin User

When starting the application for the first time, you need to create an admin user:

1. Navigate to http://localhost:3000/auth/register
2. Fill in the registration form with:
   - Full Name
   - Email
   - Password
   - Registration Secret (must match the REGISTRATION_SECRET in your .env.local file)
3. After successful registration, you can log in with your new credentials at http://localhost:3000/auth/login

## Project Structure

- `/components` - React components
- `/lib` - Utility functions and database connection
- `/models` - MongoDB schema models
- `/pages` - Next.js pages and API routes
- `/styles` - CSS and styling files
- `/docs` - Documentation files

## Database Design

The system uses MongoDB with the following key collections:

- **Donors** - Donor personal and medical information
- **BloodUnits** - Individual blood unit tracking
- **Recipients** - Recipient information and history
- **Storage** - Storage location management
- **Users** - System users and authentication

## API Routes

- `/api/donors` - Donor management endpoints
- `/api/recipients` - Recipient management endpoints
- `/api/inventory` - Blood inventory management
- `/api/auth` - Authentication endpoints

## Troubleshooting

### Login Issues

If you're having trouble logging in:

1. Make sure you've created a user account through the registration page
2. Verify your MongoDB connection string in `.env.local` is correct
3. Check that your database is running and accessible
4. Ensure you're using the correct email and password

### Database Connection Issues

If you encounter database connection errors:

1. Verify your MongoDB URI in `.env.local`
2. Check if your MongoDB server is running
3. Ensure network connectivity to your MongoDB server
4. Check for valid credentials in your connection string

### Routing Conflicts

If you see warnings about duplicate routes:

```
- warn Duplicate page detected. pages\donors\[id].js and pages\donors\[id]\index.js resolve to /donors/[id]
- warn Duplicate page detected. pages\api\inventory\storage\temperature.js and pages\api\inventory\storage\temperature\index.js resolve to /api/inventory/storage/temperature
```

These have been fixed in the latest version. If they persist:

1. Make sure you've pulled the latest version of the code
2. Restart the development server after pulling changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Mercy Wamaitha Mathu - Bachelor of Science in Information Technology (BIT)
