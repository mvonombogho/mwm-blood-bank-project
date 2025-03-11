import mongoose from 'mongoose';

const StorageSchema = new mongoose.Schema({
  storageUnitId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  facilityId: {
    type: String,
    required: true,
    trim: true
  },
  facilityName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Refrigerator', 'Freezer', 'Room Temperature Storage', 'Deep Freezer', 'Transport Cooler', 'Other'],
    required: true
  },
  location: {
    building: {
      type: String,
      required: true
    },
    floor: {
      type: String
    },
    room: {
      type: String,
      required: true
    },
    notes: {
      type: String
    }
  },
  temperature: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    units: {
      type: String,
      enum: ['Celsius', 'Fahrenheit'],
      default: 'Celsius'
    }
  },
  capacity: {
    total: {
      type: Number,
      required: true
    },
    used: {
      type: Number,
      default: 0
    },
    availablePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    units: {
      type: String,
      enum: ['Units', 'Liters', 'Cubic Feet', 'Shelves'],
      default: 'Units'
    }
  },
  model: {
    manufacturer: {
      type: String
    },
    modelNumber: {
      type: String
    },
    serialNumber: {
      type: String
    },
    year: {
      type: Number
    }
  },
  maintenance: {
    lastMaintenanceDate: {
      type: Date
    },
    nextMaintenanceDate: {
      type: Date
    },
    maintenanceInterval: {
      type: Number, // in days
      default: 90
    },
    responsible: {
      type: String
    }
  },
  monitoring: {
    hasAlarm: {
      type: Boolean,
      default: true
    },
    alarmSettings: {
      temperatureHigh: {
        type: Number
      },
      temperatureLow: {
        type: Number
      },
      notifyContacts: [{
        name: {
          type: String
        },
        email: {
          type: String
        },
        phone: {
          type: String
        },
        notifyMethod: {
          type: String,
          enum: ['Email', 'SMS', 'Both'],
          default: 'Email'
        }
      }]
    },
    monitoringFrequency: {
      type: Number, // in minutes
      default: 30
    },
    autoLogging: {
      type: Boolean,
      default: true
    }
  },
  bloodTypes: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Any']
  }],
  componentTypes: [{
    type: String,
    enum: ['Whole Blood', 'Plasma', 'Platelets', 'RBC', 'Cryoprecipitate', 'Any']
  }],
  status: {
    type: String,
    enum: ['Operational', 'Maintenance', 'Malfunction', 'Offline'],
    default: 'Operational'
  },
  currentTemperature: {
    value: {
      type: Number
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Normal', 'Warning', 'Critical'],
      default: 'Normal'
    }
  },
  notes: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for common queries
StorageSchema.index({ facilityId: 1 });
StorageSchema.index({ status: 1 });
StorageSchema.index({ bloodTypes: 1 });
StorageSchema.index({ componentTypes: 1 });
StorageSchema.index({ 'capacity.availablePercentage': 1 });

export default mongoose.models.Storage || mongoose.model('Storage', StorageSchema);
