# System Architecture

This document provides an overview of the Blood Bank Management System architecture, including component relationships, data flow, and design decisions.

## System Overview

The Blood Bank Management System is a web-based application built using Next.js and MongoDB. It follows a client-server architecture with the frontend and backend tightly integrated within the Next.js framework.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Next.js Server                       │
│  ┌─────────────────┐        ┌────────────────────────┐  │
│  │     Pages       │        │     API Routes         │  │
│  │  (React UI)     │◄──────►│    (Backend Logic)     │  │
│  └─────────────────┘        └──────────┬─────────────┘  │
└───────────────────────────────────────┬─────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │ Blood Units │  │   Storage   │  │ Donors/Recipients │ │
│  └─────────────┘  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Structure

The application is structured following a modular approach:

### Frontend Components

Frontend components are organized by feature domain:

1. **Layout Components**: Provide the overall UI structure
   - `Layout.js`: Main layout wrapper
   - `Navbar.js`: Navigation header
   - `Sidebar.js`: Side navigation menu

2. **Inventory Components**: Blood inventory management
   - `BloodInventoryDashboard.js`: Dashboard visualization
   - `EnhancedBloodUnitManagement.js`: Blood unit management
   - `StorageManagement.js`: Storage management
   - `ExpiryCalendar.js`: Expiry tracking calendar
   - `ExpiredUnitsManager.js`: Expired units management

3. **Donor Components**: Donor management
   - `DonorList.js`: Donor listing
   - `DonorDetails.js`: Donor information
   - `DonorForm.js`: Add/edit donor

4. **Recipient Components**: Recipient management
   - `RecipientList.js`: Recipient listing
   - `RecipientDetails.js`: Recipient information
   - `RecipientForm.js`: Add/edit recipient

5. **Auth Components**: Authentication
   - `LoginForm.js`: User login
   - `RegisterForm.js`: User registration

### Backend Components

Backend logic is implemented through Next.js API routes:

1. **API Routes**: Organized by feature domain
   - `/api/inventory/`: Blood inventory endpoints
   - `/api/donors/`: Donor management endpoints
   - `/api/recipients/`: Recipient management endpoints
   - `/api/users/`: User management endpoints
   - `/api/auth/`: Authentication endpoints

2. **Middleware**: Cross-cutting concerns
   - Authentication validation
   - Error handling
   - Request validation

3. **Database Models**: MongoDB schemas
   - `BloodUnit.js`: Blood unit schema
   - `Storage.js`: Storage unit schema
   - `StorageLog.js`: Temperature logs schema
   - `Donor.js`: Donor schema
   - `Recipient.js`: Recipient schema
   - `User.js`: User schema

## Data Flow

The typical data flow through the system:

1. User interacts with React components in the browser
2. React components trigger API calls to Next.js API routes
3. API routes handle authentication and validation
4. API routes interact with MongoDB via Mongoose models
5. Data is returned to API routes, then to React components
6. React components update the UI based on returned data

## Authentication Flow

1. User submits login credentials
2. NextAuth.js validates credentials against database
3. On success, a session token is issued
4. Session token is stored in cookies
5. Protected routes and API endpoints verify this token
6. Role-based access controls determine permitted actions

## Database Design

The MongoDB database uses a document-oriented design:

### Key Collections

- **bloodunits**: Stores all blood unit information
- **storage**: Stores storage unit information
- **storagelogs**: Stores temperature monitoring logs
- **donors**: Stores donor information
- **recipients**: Stores recipient information
- **users**: Stores system user accounts

### Relationships

MongoDB relationships are handled through:

1. **References**: Using ObjectId references
   - Blood units reference donors and recipients
   - Storage logs reference storage units

2. **Embedded Documents**: For closely related data
   - Status history embedded in blood units
   - Temperature readings embedded in storage logs

### Indexing Strategy

Strategic indexes to optimize query performance:

- Blood unit indexes on bloodType, status, and expirationDate
- Storage unit indexes on facilityId and status
- Indexes on common search fields (e.g., name, email, unitId)

## Design Decisions

### Next.js as Unified Framework

Next.js was chosen for its ability to unify frontend and backend logic in a single framework, simplifying development and deployment.

### MongoDB for Flexibility

MongoDB was selected for its document-oriented nature, which provides:
- Schema flexibility for evolving requirements
- Rapid development with minimal schema changes
- Good performance for read-heavy operations
- Native JSON support

### Chakra UI for Interface

Chakra UI was chosen for:
- Accessibility built-in
- Responsive design components
- Theming capabilities
- Consistent UI experience

### Chart.js for Visualizations

Chart.js was selected for:
- Wide range of chart types
- Responsive design
- Good performance with large datasets
- Customization options

## Performance Considerations

1. **Data Fetching**: 
   - Efficient querying with proper MongoDB indexes
   - API route optimizations to minimize database calls

2. **Rendering Optimizations**:
   - Component memoization for expensive renders
   - Virtualization for long lists (blood units, donors)

3. **State Management**:
   - Local component state for UI-specific state
   - Context API for shared state
   - SWR for data fetching, caching, and revalidation

## Security Measures

1. **Authentication**: NextAuth.js for secure authentication
2. **Authorization**: Role-based access control
3. **Data Validation**: Server-side validation of all input
4. **HTTPS**: All communications secured via HTTPS
5. **CSRF Protection**: Built-in protection via Next.js
6. **Content Security Policy**: Restricts resource loading

## Scalability

The system is designed to scale in the following ways:

1. **Horizontal Scaling**: 
   - Stateless API routes can be scaled horizontally
   - MongoDB can be scaled with sharding and replication

2. **Vertical Scaling**:
   - Database indexes for query performance
   - Connection pooling for database efficiency

3. **Caching**:
   - SWR provides client-side caching
   - API responses can be cached

## Monitoring & Maintenance

1. **Error Tracking**:
   - Console logging of errors
   - Structured error responses

2. **Performance Monitoring**:
   - Database query performance tracking
   - API response time monitoring

3. **Backup Strategy**:
   - Regular MongoDB backups
   - Point-in-time recovery capability

## Future Architecture Considerations

1. **Microservices Evolution**:
   - Potential to split into microservices for larger scale
   - Separate services for inventory, donors, and recipients

2. **Real-time Updates**:
   - WebSocket integration for live dashboard updates
   - Real-time alerts for critical storage conditions

3. **Mobile Application**:
   - API endpoints designed to support mobile applications
   - Mobile-friendly authentication flows

4. **Advanced Analytics**:
   - Data warehousing for historical analysis
   - Business intelligence integration
