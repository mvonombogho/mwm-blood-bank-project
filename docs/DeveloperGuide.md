# Developer Guide

This guide provides technical information for developers working on the Blood Bank Management System. It covers setting up the development environment, codebase organization, and best practices.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Code Conventions](#code-conventions)
4. [Workflow](#workflow)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Common Tasks](#common-tasks)
8. [Architecture Overview](#architecture-overview)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)

## Development Environment Setup

### Prerequisites

To work on this project, you'll need:

- **Node.js** (version 14.x or later)
- **npm** (6.x or later)
- **MongoDB** (4.4 or later)
- **Git**
- A code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**

```bash
git clone https://github.com/mvonombogho/mwm-blood-bank-project.git
cd mwm-blood-bank-project
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/blood-bank
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Replace `your_secret_key` with a secure random string.

4. **Start MongoDB**

Ensure MongoDB is running on your local machine or update the `MONGODB_URI` to point to your MongoDB instance.

5. **Start the development server**

```bash
npm run dev
```

The application should now be accessible at http://localhost:3000.

## Project Structure

The project follows a standard Next.js structure with additional organization for a large-scale application:

```
├── components/          # React components
│   ├── auth/            # Authentication components
│   ├── donors/          # Donor management components
│   ├── inventory/       # Inventory management components
│   ├── common/          # Shared UI components
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
├── docs/                # Documentation
├── public/              # Static assets
└── tests/               # Test files
```

### Key Directories

- **components**: Reusable React components organized by feature domain
- **pages**: Next.js pages and API routes
- **models**: MongoDB schemas for database collections
- **lib**: Utility functions, middleware, and helpers

## Code Conventions

### JavaScript

- Use ES6+ syntax
- Use async/await for asynchronous operations
- Prefer const over let, and avoid var
- Use destructuring where appropriate
- Follow camelCase for variables and functions
- Follow PascalCase for component names

### React

- Use functional components with hooks
- Keep components small and focused
- Use Chakra UI components for consistent styling
- Follow component composition patterns
- Use React Context for global state when appropriate

### API

- RESTful API design
- Descriptive error messages
- Consistent response formats
- Proper HTTP status codes
- Validation for all inputs

### Git

- Use feature branches (e.g., `feature/blood-unit-management`)
- Write descriptive commit messages
- Squash commits when merging to main
- Keep pull requests focused on a single feature or fix

## Workflow

### Feature Development

1. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
2. Implement the feature
3. Write tests
4. Create a pull request to `main`
5. Address review feedback
6. Merge after approval

### Bug Fixes

1. Create a branch from `main`: `git checkout -b fix/bug-description`
2. Fix the issue
3. Add a test case to prevent regression
4. Create a pull request to `main`
5. Merge after approval

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run a specific test file
npm test -- tests/components/inventory/BloodUnitManagement.test.js
```

### Testing Strategy

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test interaction between components
- **API Tests**: Test API endpoints
- **End-to-End Tests**: Test complete user flows

### Test Coverage

Aim for at least 80% test coverage for critical components and API endpoints.

## Deployment

### Preparation

1. Ensure all tests pass
2. Update version in `package.json` if applicable
3. Build the application: `npm run build`
4. Test the production build: `npm start`

### Deployment Options

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy to Vercel.

#### Custom Server

1. Build the application: `npm run build`
2. Deploy the `.next` directory and server files to your hosting environment
3. Set up environment variables
4. Start the server: `npm start`

## Common Tasks

### Adding a New Component

1. Create a new file in the appropriate directory under `components/`
2. Import necessary dependencies
3. Define the component
4. Export the component
5. Use the component in pages or other components

Example:

```jsx
// components/inventory/SomeNewComponent.js
import { useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const SomeNewComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  // Component logic
  
  return (
    <Box>
      <Heading>{prop1}</Heading>
      <Text>{prop2}</Text>
    </Box>
  );
};

export default SomeNewComponent;
```

### Adding a New API Endpoint

1. Create a new file in the appropriate directory under `pages/api/`
2. Import necessary dependencies and models
3. Define the handler function
4. Export the handler

Example:

```javascript
// pages/api/inventory/some-endpoint.js
import { connectToDatabase } from '../../../lib/mongodb';
import SomeModel from '../../../models/SomeModel';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // Check HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Connect to database
    await connectToDatabase();

    // Handle request
    const data = await SomeModel.find({});
    
    // Return response
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
```

### Adding a New Database Model

1. Create a new file in the `models/` directory
2. Define the schema
3. Create and export the model

Example:

```javascript
// models/SomeModel.js
import mongoose from 'mongoose';

const SomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes
SomeSchema.index({ name: 1 });

export default mongoose.models.SomeModel || mongoose.model('SomeModel', SomeSchema);
```

## Architecture Overview

For a detailed architecture overview, see [Architecture.md](./Architecture.md).

### Key Components

- **Next.js**: Frontend and backend framework
- **MongoDB**: Document database
- **NextAuth.js**: Authentication provider
- **Chakra UI**: UI component library
- **Chart.js**: Visualization library

### Data Flow

See [Architecture.md](./Architecture.md) for a detailed data flow diagram.

## Security Considerations

### Authentication

- **NextAuth.js**: Handles user sessions and authentication
- **JWT**: Used for API authentication
- **Role-Based Access Control**: Restricts access based on user role

### API Security

- Validate all inputs
- Sanitize user-generated content
- Use proper HTTP status codes
- Implement rate limiting for sensitive endpoints
- Avoid exposing internal errors

### Database Security

- Validate and sanitize all queries
- Use indexed fields for queries
- Implement field-level access control
- Never trust client-side data

## Performance Optimization

### Frontend

- Memoize expensive component renders
- Minimize state updates
- Use virtualization for long lists
- Implement proper loading states
- Use Next.js Image component for optimized images

### API

- Implement pagination for large datasets
- Use proper indexes for MongoDB queries
- Cache frequent requests
- Handle errors gracefully
- Validate input data early

### Database

- Create appropriate indexes
- Use projection to limit returned fields
- Use aggregation pipeline for complex queries
- Implement connection pooling
- Monitor query performance
