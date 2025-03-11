# User Guide

This guide provides instructions for using the Blood Bank Management System. It's designed for end users who need to perform day-to-day operations within the system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Navigation](#dashboard-navigation)
3. [Blood Inventory Management](#blood-inventory-management)
4. [Storage Management](#storage-management)
5. [Expiry Tracking](#expiry-tracking)
6. [Donor Management](#donor-management)
7. [Recipient Management](#recipient-management)
8. [User Management](#user-management)
9. [Reports](#reports)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Logging In

1. Navigate to the Blood Bank Management System login page
2. Enter your username/email and password
3. Click "Sign In"

### First-time Setup

If you're setting up the system for the first time:

1. Navigate to `/auth/register?isAdmin=true` (this special URL works only for the first user)
2. Create an administrator account
3. Log in with the administrator account
4. Create additional user accounts as needed

### Role-Based Access

The system has different roles with varying permissions:

- **Administrator**: Full access to all system features
- **Manager**: Access to most features except user management
- **Technician**: Access to blood inventory and storage management
- **Donor Coordinator**: Access to donor management
- **Staff**: Limited access to view data only

## Dashboard Navigation

### Main Dashboard

The main dashboard provides an overview of the blood bank's current status:

1. **Blood Inventory Overview**: Shows current inventory levels by blood type
2. **Critical Alerts**: Highlights low stock or expiring units
3. **Storage Status**: Displays storage condition alerts
4. **Recent Activity**: Shows recent system activities

### Navigation Menu

Use the sidebar to navigate to different sections:

- **Dashboard**: System overview
- **Inventory**: Blood unit management
- **Storage**: Storage unit management
- **Expiry Tracking**: Track and manage expiring units
- **Donors**: Donor management
- **Recipients**: Recipient management
- **Reports**: Generate reports
- **Settings**: System settings

## Blood Inventory Management

### Viewing Blood Units

To view the blood inventory:

1. Navigate to **Inventory** > **Blood Units**
2. Use filters to narrow down results:
   - Filter by blood type
   - Filter by status
   - Search by unit ID or location

### Adding a Blood Unit

To add a new blood unit:

1. Navigate to **Inventory** > **Blood Units**
2. Click the "Add New Blood Unit" button
3. Fill in the required information:
   - Unit ID
   - Donor ID
   - Blood Type
   - Collection Date
   - Expiration Date
   - Quantity
   - Location details
4. Click "Save" to add the unit

### Updating Blood Unit Status

To update a blood unit's status:

1. Navigate to **Inventory** > **Blood Units**
2. Find the unit you want to update
3. Click the "Edit" icon (pencil)
4. Select the new status from the dropdown
5. Add notes explaining the status change
6. Click "Update Status" to save

### Viewing Unit Details

To view detailed information about a blood unit:

1. Navigate to **Inventory** > **Blood Units**
2. Find the unit you want to view
3. Click the "View" icon (eye)
4. The details page shows:
   - Basic information
   - Processing details
   - Status history
   - Transfusion record (if applicable)

## Storage Management

### Viewing Storage Units

To view storage units:

1. Navigate to **Inventory** > **Storage**
2. The page displays all storage units with:
   - Name and location
   - Current status
   - Current temperature
   - Capacity usage

### Adding a Storage Unit

To add a new storage unit:

1. Navigate to **Inventory** > **Storage**
2. Click "Add Storage Unit"
3. Fill in the required information:
   - Storage Unit ID
   - Name
   - Facility
   - Type
   - Location details
   - Temperature range
   - Capacity
4. Click "Save" to add the unit

### Temperature Monitoring

To view temperature history for a storage unit:

1. Navigate to **Inventory** > **Storage**
2. Click the "Temperature Monitoring" tab
3. Select a storage unit from the list
4. View the temperature chart showing historical readings
5. Toggle between different time periods (24h, 7d, 30d)

### Logging Temperature Readings

To add a temperature reading:

1. Navigate to **Inventory** > **Storage**
2. Select a storage unit
3. Click "Log Temperature"
4. Enter the current temperature reading
5. Add humidity (optional)
6. Add notes (optional)
7. Click "Save Reading"

## Expiry Tracking

### Viewing Upcoming Expirations

To view upcoming expirations:

1. Navigate to **Inventory** > **Expiry Tracking**
2. The calendar view shows:
   - Days with expiring units highlighted
   - Color coding for urgency (green, orange, red)
   - Unit counts by expiry urgency

### Managing Expired Units

To manage expired units:

1. Navigate to **Inventory** > **Expiry Tracking**
2. Click the "Expired Units Management" tab
3. View all expired units requiring disposal
4. Select units to process by checking the boxes
5. Click "Process Selected"
6. Choose a disposal method
7. Add notes about the disposal
8. Click "Confirm Processing"

## Donor Management

### Viewing Donors

To view donor information:

1. Navigate to **Donors** > **Donor List**
2. Use filters to find specific donors:
   - Filter by blood type
   - Filter by eligibility status
   - Search by name or ID

### Adding a Donor

To add a new donor:

1. Navigate to **Donors** > **Donor List**
2. Click "Add Donor"
3. Fill in donor information:
   - Personal details
   - Contact information
   - Blood type
   - Medical history
4. Click "Save" to add the donor

### Recording Donations

To record a donation:

1. Navigate to **Donors** > **Donor List**
2. Find the donor
3. Click "Record Donation"
4. Fill in donation details:
   - Donation date
   - Donation type
   - Quantity
   - Processing information
5. Click "Save" to record the donation
6. The system will automatically create a blood unit

### Tracking Donor Health

To record donor health information:

1. Navigate to **Donors** > **Donor List**
2. Find the donor
3. Click "Health Record"
4. Add health screening results:
   - Vital signs
   - Test results
   - Eligibility determination
5. Click "Save" to update health records

## Recipient Management

### Viewing Recipients

To view recipient information:

1. Navigate to **Recipients** > **Recipient List**
2. Use filters to find specific recipients:
   - Filter by blood type
   - Filter by hospital
   - Search by name or ID

### Adding a Recipient

To add a new recipient:

1. Navigate to **Recipients** > **Recipient List**
2. Click "Add Recipient"
3. Fill in recipient information:
   - Personal details
   - Medical information
   - Blood type
   - Hospital details
4. Click "Save" to add the recipient

### Recording Transfusions

To record a transfusion:

1. Navigate to **Recipients** > **Recipient List**
2. Find the recipient
3. Click "Record Transfusion"
4. Fill in transfusion details:
   - Select blood unit(s)
   - Transfusion date
   - Physician
   - Notes
5. Click "Save" to record the transfusion
6. The system will automatically update the blood unit status

## User Management

### Viewing Users

To view system users (Administrator role required):

1. Navigate to **Settings** > **User Management**
2. The page displays all users with:
   - Name and contact information
   - Role
   - Status (Active/Inactive)

### Adding a User

To add a new user (Administrator role required):

1. Navigate to **Settings** > **User Management**
2. Click "Add User"
3. Fill in user details:
   - Name
   - Email
   - Role
   - Initial password
4. Click "Save" to create the user
5. The system will send a password reset link to the user's email

### Modifying User Permissions

To modify a user's role or permissions:

1. Navigate to **Settings** > **User Management**
2. Find the user
3. Click "Edit"
4. Modify role or specific permissions
5. Click "Save" to update

## Reports

### Generating Inventory Reports

To generate an inventory report:

1. Navigate to **Reports** > **Inventory Reports**
2. Select report type:
   - Current Inventory Status
   - Inventory Movement
   - Expiry Report
3. Set date range (if applicable)
4. Select format (PDF, Excel, CSV)
5. Click "Generate Report"

### Generating Donor Reports

To generate a donor report:

1. Navigate to **Reports** > **Donor Reports**
2. Select report type:
   - Donor Activity
   - Donor Demographics
   - Donation Trends
3. Set date range
4. Select format
5. Click "Generate Report"

### Generating Storage Reports

To generate a storage condition report:

1. Navigate to **Reports** > **Storage Reports**
2. Select storage unit(s)
3. Set date range
4. Select data to include:
   - Temperature readings
   - Alarms
   - Maintenance records
5. Select format
6. Click "Generate Report"

## Troubleshooting

### Common Issues

#### Login Problems

- **Issue**: Unable to log in
- **Solution**: 
  1. Verify username and password
  2. Check if account is locked
  3. Contact administrator if problem persists

#### Missing Data

- **Issue**: Expected data not appearing
- **Solution**:
  1. Refresh the page
  2. Clear browser cache
  3. Verify you have the necessary permissions
  4. Contact administrator if problem persists

#### Slow Performance

- **Issue**: System running slowly
- **Solution**:
  1. Reduce the date range of reports
  2. Close other browser tabs
  3. Wait and try again during off-peak hours

### Getting Help

For additional assistance:

1. Click the "Help" icon in the top right corner
2. Check the FAQ section
3. Contact system administrator at [admin@bloodbank.org](mailto:admin@bloodbank.org)
4. Call support at [+1-234-567-8900](tel:+12345678900)

### Reporting Bugs

To report a system bug:

1. Take a screenshot of the issue
2. Note the steps to reproduce the problem
3. Click the "Report Issue" button in the footer
4. Fill in the bug report form
5. Submit the report
