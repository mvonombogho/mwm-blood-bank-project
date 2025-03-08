# Blood Bank Management System

A comprehensive blood bank management system built with Next.js and MongoDB.

## Project Overview

This system helps blood banks manage their donations and distributions effectively by tracking donors, blood inventory, and recipients.

## Features

- Donor Management
- Blood Inventory Management
- Recipient Management
- Reports Generation
- Authentication System

## Tech Stack

- Next.js
- MongoDB
- Chakra UI

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
   
2. API Routes
* **Donor Management**:
   * `/api/donors/status` - Donor health status tracking
* **Inventory Management**:
   * `/api/inventory/blood-units` - Blood inventory CRUD operations
   * `/api/inventory/storage` - Storage management
   * `/api/inventory/storage/temperature` - Temperature tracking
   * `/api/inventory/storage/maintenance` - Maintenance management
* **Contact Management**:
   * `/api/donors/contact` - Communication preferences and history
* **Recipient Management**:
   * `/api/recipients` - Recipient CRUD operations
   * `/api/recipients/blood-requests` - Blood request management
   * `/api/recipients/transfusions` - Transfusion records
   
3. Frontend Components
* **Inventory Management**:
   * Inventory dashboard with overview
   * InventoryList component for managing blood units
   * AddBloodUnit form component
   * StorageManagement component for temperature tracking
* **Recipient Management** (partial):
   * Main recipient dashboard page
   
4. System Infrastructure
* MongoDB connection utilities
* Environment variable configuration

### In Progress Components
1. Frontend Components
* **Recipient Management** (missing components):
   * RecipientList component
   * AddRecipientForm component
   * BloodRequestsView component
   * TransfusionRecordView component
2. Reports Generation System
3. Authentication System

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
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Run the development server
npm run dev
```

## Project Structure

```
├── components/          # React components
├── models/              # MongoDB schema models
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   └── ...              # UI pages
├── public/              # Static assets
├── styles/              # CSS styles
├── lib/                 # Utility functions
└── ...                  # Other configuration files
```

## Author

Mercy Wamaitha Mathu (22/00067)