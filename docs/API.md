# API Documentation

This document provides detailed information about the Blood Bank Management System API endpoints.

## Authentication

All API endpoints require authentication unless specifically noted. Authentication is handled via NextAuth.js.

### Headers

```
Authorization: Bearer {token}
```

### Error Responses

All endpoints may return these error status codes:

- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but lacking permission
- `500 Internal Server Error`: Server-side error

## Blood Inventory

### Dashboard Data

Retrieves data for the blood inventory dashboard.

- **URL**: `/api/inventory/dashboard`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "byBloodType": {
      "A+": 12,
      "B+": 8,
      "O+": 15,
      // Other blood types...
    },
    "byStatus": {
      "Available": 50,
      "Reserved": 10,
      "Quarantined": 5,
      // Other statuses...
    },
    "criticalLevels": [
      { "bloodType": "AB-", "count": 2 },
      // Other critical levels...
    ],
    "expiringUnits": {
      "soon": 8,
      "veryClose": 2
    },
    "temperatureAlerts": [
      {
        "location": "Main Facility - Refrigerator 1",
        "currentTemp": 5.5,
        "minTemp": 2.0,
        "maxTemp": 6.0,
        "status": "Warning"
      },
      // Other temperature alerts...
    ]
  }
  ```

### Blood Units

#### List Blood Units

Retrieves a list of blood units with optional filtering.

- **URL**: `/api/inventory/blood-units`
- **Method**: `GET`
- **Query Parameters**:
  - `status`: Filter by status
  - `bloodType`: Filter by blood type
  - `expiring`: If "true", returns only units expiring within 7 days
  - `search`: Search term for unitId, facility, etc.

- **Response**:
  ```json
  [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "unitId": "BU12345",
      "donorId": "60d21b4667d0d8992e610c80",
      "bloodType": "A+",
      "collectionDate": "2023-01-15T00:00:00.000Z",
      "expirationDate": "2023-02-15T00:00:00.000Z",
      "quantity": 450,
      "status": "Available",
      "location": {
        "facility": "Main Facility",
        "storageUnit": "Refrigerator 1",
        "shelf": "B",
        "position": "3"
      },
      // Other properties...
    },
    // More blood units...
  ]
  ```

#### Add Blood Unit

Adds a new blood unit to the inventory.

- **URL**: `/api/inventory/blood-units`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "unitId": "BU12345",
    "donorId": "60d21b4667d0d8992e610c80",
    "bloodType": "A+",
    "collectionDate": "2023-01-15T00:00:00.000Z",
    "expirationDate": "2023-02-15T00:00:00.000Z",
    "quantity": 450,
    "status": "Quarantined",
    "location": {
      "facility": "Main Facility",
      "storageUnit": "Refrigerator 1",
      "shelf": "B",
      "position": "3"
    }
    // Other properties...
  }
  ```

- **Response**: The created blood unit object

#### Get Blood Unit

Retrieves a specific blood unit by ID.

- **URL**: `/api/inventory/blood-units/[id]`
- **Method**: `GET`
- **Response**: The blood unit object

#### Update Blood Unit

Updates a specific blood unit.

- **URL**: `/api/inventory/blood-units/[id]`
- **Method**: `PUT`
- **Body**: Object with fields to update
- **Response**: The updated blood unit object

#### Delete Blood Unit

Deletes a specific blood unit.

- **URL**: `/api/inventory/blood-units/[id]`
- **Method**: `DELETE`
- **Response**: 
  ```json
  {
    "message": "Blood unit deleted successfully"
  }
  ```

#### Update Blood Unit Status

Updates the status of a specific blood unit.

- **URL**: `/api/inventory/blood-units/[id]/status`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "status": "Available",
    "notes": "Optional notes about this status change"
  }
  ```
- **Response**: The updated blood unit object

#### Batch Update Blood Unit Status

Updates the status of multiple blood units at once.

- **URL**: `/api/inventory/blood-units/batch-status`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "unitIds": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
    "status": "Discarded",
    "notes": "Expired units processed in batch"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Updated 2 blood units",
    "unitsUpdated": 2,
    "unitsNotFound": 0,
    "missingUnitIds": []
  }
  ```

### Storage Management

#### List Storage Units

Retrieves a list of storage units.

- **URL**: `/api/inventory/storage`
- **Method**: `GET`
- **Response**: Array of storage unit objects

#### Add Storage Unit

Adds a new storage unit.

- **URL**: `/api/inventory/storage`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "storageUnitId": "SU001",
    "name": "Refrigerator 1",
    "facilityId": "FAC001",
    "facilityName": "Main Facility",
    "type": "Refrigerator",
    "location": {
      "building": "Building A",
      "floor": "1",
      "room": "103"
    },
    "temperature": {
      "min": 2,
      "max": 6,
      "target": 4,
      "units": "Celsius"
    }
    // Other properties...
  }
  ```
- **Response**: The created storage unit object

#### Get Storage Unit

Retrieves a specific storage unit.

- **URL**: `/api/inventory/storage/[id]`
- **Method**: `GET`
- **Response**: The storage unit object

#### Update Storage Unit

Updates a specific storage unit.

- **URL**: `/api/inventory/storage/[id]`
- **Method**: `PUT`
- **Body**: Object with fields to update
- **Response**: The updated storage unit object

#### Delete Storage Unit

Deletes a specific storage unit.

- **URL**: `/api/inventory/storage/[id]`
- **Method**: `DELETE`
- **Response**: 
  ```json
  {
    "message": "Storage unit deleted successfully"
  }
  ```

#### Add Temperature Reading

Adds a new temperature reading for a storage unit.

- **URL**: `/api/inventory/storage/temperature-logs`
- **Method**: `POST`
- **Query Parameters**:
  - `storageUnitId`: ID of the storage unit
- **Body**:
  ```json
  {
    "temperature": 4.2,
    "humidity": 45.5,
    "status": "Normal",
    "notes": "Routine check"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Temperature reading added successfully",
    "reading": {
      "temperature": 4.2,
      "humidity": 45.5,
      "recordedAt": "2023-01-15T14:25:00.000Z",
      "recordedBy": "John Doe",
      "status": "Normal",
      "notes": "Routine check"
    }
  }
  ```

#### Get Temperature Logs

Retrieves temperature logs for a specific storage unit.

- **URL**: `/api/inventory/storage/temperature-logs`
- **Method**: `GET`
- **Query Parameters**:
  - `storageUnitId`: ID of the storage unit
  - `period`: "day", "week", or "month" (default: "day")
- **Response**:
  ```json
  {
    "storageUnitId": "SU001",
    "storageUnitName": "Refrigerator 1",
    "facilityName": "Main Facility",
    "period": "day",
    "temperatureRange": {
      "min": 2,
      "max": 6,
      "target": 4,
      "units": "Celsius"
    },
    "readings": [
      {
        "time": "2023-01-15 09:00",
        "timestamp": "2023-01-15T09:00:00.000Z",
        "temperature": 4.2,
        "humidity": 45.5,
        "status": "Normal"
      },
      // More readings...
    ]
  }
  ```

### Expiry Tracking

#### Get Expiring Units

Retrieves blood units that are expiring or have expired.

- **URL**: `/api/inventory/expiry-tracking`
- **Method**: `GET`
- **Query Parameters**:
  - `startDate`: Start date (YYYY-MM-DD)
  - `endDate`: End date (YYYY-MM-DD)
  - `expired`: If "true", returns expired units instead of upcoming
  - `date`: Current date (YYYY-MM-DD) for calculating expiry status
- **Response**: Array of blood unit objects with expiry information

## Donors

### List Donors

Retrieves a list of donors.

- **URL**: `/api/donors`
- **Method**: `GET`
- **Response**: Array of donor objects

### Add Donor

Adds a new donor.

- **URL**: `/api/donors`
- **Method**: `POST`
- **Response**: The created donor object

## Recipients

### List Recipients

Retrieves a list of recipients.

- **URL**: `/api/recipients`
- **Method**: `GET`
- **Response**: Array of recipient objects

### Add Recipient

Adds a new recipient.

- **URL**: `/api/recipients`
- **Method**: `POST`
- **Response**: The created recipient object

## Users

### List Users

Retrieves a list of system users.

- **URL**: `/api/users`
- **Method**: `GET`
- **Response**: Array of user objects

### Add User

Adds a new user.

- **URL**: `/api/users`
- **Method**: `POST`
- **Response**: The created user object

### Get Current User

Retrieves the currently authenticated user.

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Response**: The user object for the current user
