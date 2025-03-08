import mongoose from 'mongoose';

const RecipientSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      zipCode: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true
      }
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      relationship: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      }
    },
    medicalHistory: {
      bloodTransfusionHistory: {
        type: Boolean,
        default: false
      },
      allergies: [{
        type: String,
        trim: true
      }],
      currentMedications: [{
        medication: {
          type: String,
          trim: true
        },
        dosage: {
          type: String,
          trim: true
        },
        frequency: {
          type: String,
          trim: true
        }
      }],
      diagnosedConditions: [{
        condition: {
          type: String,
          trim: true
        },
        diagnosedDate: {
          type: Date
        },
        notes: {
          type: String
        }
      }],
      surgeries: [{
        procedure: {
          type: String,
          trim: true
        },
        date: {
          type: Date
        },
        hospital: {
          type: String,
          trim: true
        }
      }]
    },
    bloodRequests: [{
      requestId: {
        type: String,
        required: true,
        unique: true
      },
      requestDate: {
        type: Date,
        default: Date.now
      },
      bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
      },
      status: {
        type: String,
        enum: ['Pending', 'Processing', 'Fulfilled', 'Cancelled'],
        default: 'Pending'
      },
      requiredBy: {
        type: Date
      },
      hospital: {
        type: String,
        required: true,
        trim: true
      },
      physician: {
        type: String,
        required: true,
        trim: true
      },
      reason: {
        type: String,
        required: true
      },
      notes: {
        type: String
      }
    }],
    transfusionRecords: [{
      transfusionId: {
        type: String,
        required: true
      },
      bloodUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodUnit',
        required: true
      },
      transfusionDate: {
        type: Date,
        required: true
      },
      hospital: {
        type: String,
        required: true,
        trim: true
      },
      physician: {
        type: String,
        required: true,
        trim: true
      },
      bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      diagnosis: {
        type: String,
        required: true
      },
      reactions: {
        occurred: {
          type: Boolean,
          default: false
        },
        details: {
          type: String
        },
        severity: {
          type: String,
          enum: ['Mild', 'Moderate', 'Severe', 'Life-threatening']
        },
        treatmentProvided: {
          type: String
        }
      },
      outcome: {
        type: String,
        enum: ['Successful', 'Partially Successful', 'Unsuccessful', 'Complications']
      },
      notes: {
        type: String
      }
    }],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Deceased'],
      default: 'Active'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    lastTransfusionDate: {
      type: Date
    },
    transfusionCount: {
      type: Number,
      default: 0
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
RecipientSchema.index({ firstName: 1, lastName: 1 });
RecipientSchema.index({ bloodType: 1 });
RecipientSchema.index({ status: 1 });
RecipientSchema.index({ 'bloodRequests.status': 1 });
RecipientSchema.index({ 'bloodRequests.urgency': 1 });

export default mongoose.models.Recipient || mongoose.model('Recipient', RecipientSchema);