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

## Project Status

### Completed Components
1. Database Models
* **Donor Models**:
   * `Donor.js` - Main donor information
   * `DonorHealth.js` - Health metrics tracking
   * `DonorDeferral.js` - Deferral management
* **Inventory Models**:
   * `BloodUnit.js` - Blood inventory management
   * `StorageLog.js` - Temperature and status tracking
* **Communication Models**:
   * `Contact.js` - Contact preferences and communication history
* **Recipient Models**:
   * `Recipient.js` - Recipient information and medical history
* **Authentication Models**:
   * `User.js` - User management with roles and permissions
   
2. API Routes
* **Donor Management**:
   * `/api/donors/status` - Donor health status tracking
* **Inventory Management**:
   * `/api/inventory/blood-units` - Blood inventory CRUD operations
   * `/api/inventory/blood-units/stats` - Inventory statistics
   * `/api/inventory/storage` - Storage management
   * `/api/inventory/storage/temperature` - Temperature tracking
   * `/api/inventory/storage/maintenance` - Maintenance management
   * `/api/inventory/expiry-tracking` - Blood unit expiry tracking
   * `/api/inventory/reports/generate` - Report generation
* **Contact Management**:
   * `/api/donors/contact` - Communication preferences and history
* **Recipient Management**:
   * `/api/recipients` - Recipient CRUD operations
   * `/api/recipients/blood-requests` - Blood request management
   * `/api/recipients/transfusions` - Transfusion records
* **Authentication & User Management**:
   * `/api/auth/[...nextauth]` - NextAuth.js authentication endpoints
   * `/api/users` - User management CRUD operations
   * `/api/users/register` - New user registration
   * `/api/users/change-password` - Password management
   
3. Frontend Components
* **Layout and Navigation**:
   * Main layout with sidebar navigation
   * Mobile-responsive design
   * Authentication-aware menu system
* **Authentication UI**:
   * Login page
   * User registration
   * Forgot password flow
   * Auth protection for routes
   * Role-based component rendering
* **Admin Interface**:
   * User management dashboard
   * Role and permission management
   * System settings
* **Inventory Management**:
   * Inventory dashboard with overview
   * Blood Units Inventory Dashboard
   * Blood Units List component
   * Add Blood Unit modal form
   * Storage Management Interface
   * Storage Temperature Monitoring
   * Storage Units List component
   * Add Storage Unit modal form
   * Inventory Alerts system
* **Expiry Tracking**:
   * Expiry Calendar View
   * Expiry Action Cards
   * Expiry Reports
* **Reports Generation**:
   * Report Generator interface
   * Blood Supply Trends
   * Export functionality
   * Storage Conditions Report
* **Recipient Management**:
   * Main recipient dashboard page
   
4. System Infrastructure
* MongoDB connection utilities
* API utilities for error handling and response formatting
* Inventory helper utilities
* Authentication protection middleware
* Environment variable configuration

### Features & Functionality

#### Authentication & Authorization System
- Complete user authentication with NextAuth.js
- Role-based access control (Admin, Manager, Technician, Donor Coordinator, Staff)
- Fine-grained permission system for detailed access control
- Protected routes and API endpoints
- User management interface for administrators
- Password security with bcrypt hashing

#### Blood Inventory Management
- Complete tracking of blood units from donation to transfusion
- Detailed metadata including blood type, collection date, expiration date
- Status tracking (Available, Reserved, Quarantined, Transfused, Discarded, Expired)
- Storage location management
- Comprehensive filtering and search capabilities

#### Storage Condition Monitoring
- Temperature tracking for storage units
- Maintenance scheduling and history
- Alarm system for temperature fluctuations
- Historical temperature data visualization

#### Expiry Tracking
- Calendar view of upcoming expirations
- Prioritized expiry lists (Critical, Warning, Caution)
- Blood type-specific expiry analytics
- Wastage reduction recommendations

#### Reports & Analytics
- Inventory summary reports
- Expiry analysis reports
- Historical trends analysis
- Storage conditions reporting
- Critical shortage notifications
- Customizable report generation

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/mvonombogho/mwm-blood-bank-project.git

# Install dependencies
cd mwm-blood-bank-project
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

### Using the System

1. **Authentication**:
   - Login at `/auth/login`
   - Your access to various features will depend on your role and permissions

2. **User Management** (Admin only):
   - Navigate to Admin → Users
   - Add, edit, or deactivate user accounts
   - Assign roles and customize permissions

3. **Blood Inventory Management**:
   - Navigate to Inventory → Blood Units to view all blood units
   - Use the Add Blood Unit button to add new donations
   - Filter and search by various criteria
   - Change blood unit status as needed

4. **Storage Management**:
   - Navigate to Inventory → Storage to access storage monitoring
   - View temperature charts and history
   - Record maintenance activities
   - Track alarms and alerts

5. **Expiry Tracking**:
   - Navigate to Inventory → Expiry Tracking
   - View the calendar of upcoming expirations
   - Take action on units expiring soon
   - Generate expiry reports

6. **Reports**:
   - Navigate to Inventory → Reports
   - Select report type, time range, and blood types
   - View visualizations and data tables
   - Export reports in various formats

## Project Structure

```
├── components/          # React components
│   ├── auth/            # Authentication components
│   ├── inventory/       # Inventory management components
│   └── ...              # Other component categories
├── models/              # MongoDB schema models
│   ├── User.js          # User model with role & permissions
│   └── ...              # Other models
├── pages/               # Next.js pages
│   ├── admin/           # Admin interface pages
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication API routes
│   │   ├── users/       # User management API routes
│   │   └── ...          # Other API routes
│   ├── auth/            # Authentication pages (login, register)
│   ├── inventory/       # Inventory management pages
│   └── ...              # Other UI pages
├── public/              # Static assets
├── lib/                 # Utility functions
│   ├── dbConnect.js     # MongoDB connection utility
│   ├── apiUtils.js      # API response utilities
│   └── inventoryUtils.js # Inventory helper functions
└── ...                  # Configuration files
```

## Future Enhancements

1. **Enhanced Authentication**:
   - Two-factor authentication
   - Single sign-on integration
   - Password policies
   - Activity logging and audit trails

2. **Donor Portal**:
   - Online appointment scheduling
   - Donation history viewing
   - Health status checking

3. **Mobile App Integration**:
   - Mobile-friendly interfaces
   - Push notifications for critical alerts
   - Barcode scanning for blood units

4. **Advanced Analytics**:
   - Predictive modeling for blood demand
   - Geographic analysis of donors/recipients
   - Machine learning integration for optimizing blood distribution

## Author

Mercy Wamaitha Mathu (22/00067)
