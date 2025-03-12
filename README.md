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

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at [http://localhost:3000](http://localhost:3000)

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

If you encounter the following errors:

```
- warn Duplicate page detected. pages\donors\[id].js and pages\donors\[id]\index.js resolve to /donors/[id]
- warn Duplicate page detected. pages\api\inventory\storage\temperature.js and pages\api\inventory\storage\temperature\index.js resolve to /api/inventory/storage/temperature
```

These have been fixed in the latest version by:
1. Replacing duplicate pages with distinct routes
2. Creating a central MongoDB connection utility

If you see database connection errors, ensure your MongoDB connection string in `.env.local` is correct and your database server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Mercy Wamaitha Mathu - Bachelor of Science in Information Technology (BIT)
