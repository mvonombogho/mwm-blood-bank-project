import mongoose from 'mongoose';

const StorageLogSchema = new mongoose.Schema({
  storageUnitId: {
    type: String,
    required: true,
    trim: true
  },
  facilityId: {
    type: String,
    required: true,
    trim: true
  },
  readings: [{
    temperature: {
      type: Number,
      required: true
    },
    humidity: {
      type: Number
    },
    recordedAt: {
      type: Date,
      default: Date.now
    },
    recordedBy: {
      type: String
    },
    status: {
      type: String,
      enum: ['Normal', 'Warning', 'Critical'],
      default: 'Normal'
    },
    notes: {
      type: String
    }
  }],
  maintenanceHistory: [{
    maintenanceType: {
      type: String,
      enum: ['Routine', 'Repair', 'Calibration', 'Inspection'],
      required: true
    },
    performedBy: {
      type: String,
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      required: true
    },
    parts: [{
      partName: {
        type: String
      },
      partNumber: {
        type: String
      },
      quantity: {
        type: Number
      }
    }],
    nextMaintenanceDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Completed'
    },
    result: {
      type: String,
      enum: ['Pass', 'Fail', 'Partial'],
      required: true
    },
    notes: {
      type: String
    }
  }],
  alarmHistory: [{
    alarmType: {
      type: String,
      enum: ['Temperature', 'Power', 'Door', 'System', 'Other'],
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    action: {
      type: String
    },
    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Resolved', 'False Alarm'],
      default: 'Active'
    },
    notes: {
      type: String
    }
  }],
  status: {
    type: String,
    enum: ['Operational', 'Maintenance', 'Malfunction', 'Offline'],
    default: 'Operational'
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
    available: {
      type: Number
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for common queries
StorageLogSchema.index({ facilityId: 1, storageUnitId: 1 });
StorageLogSchema.index({ status: 1 });
StorageLogSchema.index({ 'readings.recordedAt': 1 });
StorageLogSchema.index({ 'alarmHistory.status': 1 });

export default mongoose.models.StorageLog || mongoose.model('StorageLog', StorageLogSchema);