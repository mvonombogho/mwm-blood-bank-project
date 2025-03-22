import mongoose from 'mongoose';

const BloodUnitSchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: false  // Changed from true to false to make donor optional
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    expirationDate: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number, // in milliliters
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Quarantined', 'Discarded', 'Transfused', 'Expired'],
      default: 'Quarantined'
    },
    // Modified location field to be optional
    location: {
      facility: {
        type: String,
        required: false
      },
      storageUnit: {
        type: String,
        required: false
      },
      shelf: {
        type: String
      },
      position: {
        type: String
      }
    },
    processingDetails: {
      technicianId: {
        type: String
      },
      processedDate: {
        type: Date
      },
      processMethod: {
        type: String,
        enum: ['Whole Blood', 'Plasma', 'Platelets', 'RBC', 'Cryoprecipitate']
      },
      testResults: {
        hiv: {
          type: Boolean
        },
        hepatitisB: {
          type: Boolean
        },
        hepatitisC: {
          type: Boolean
        },
        syphilis: {
          type: Boolean
        },
        malaria: {
          type: Boolean
        },
        other: [{
          testName: String,
          result: Boolean,
          notes: String
        }]
      }
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['Available', 'Reserved', 'Quarantined', 'Discarded', 'Transfused', 'Expired']
      },
      date: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: String
      },
      notes: {
        type: String
      }
    }],
    temperatureHistory: [{
      temperature: {
        type: Number
      },
      recordedAt: {
        type: Date,
        default: Date.now
      },
      recordedBy: {
        type: String
      }
    }],
    transfusionRecord: {
      recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipient'
      },
      transfusionDate: {
        type: Date
      },
      hospital: {
        type: String
      },
      physician: {
        type: String
      },
      notes: {
        type: String
      }
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Add indexes for common queries
BloodUnitSchema.index({ bloodType: 1, status: 1 });
BloodUnitSchema.index({ expirationDate: 1 });
BloodUnitSchema.index({ donorId: 1 });
BloodUnitSchema.index({ 'transfusionRecord.recipientId': 1 });
BloodUnitSchema.index({ 'location.facility': 1, 'location.storageUnit': 1 });

export default mongoose.models.BloodUnit || mongoose.model('BloodUnit', BloodUnitSchema);