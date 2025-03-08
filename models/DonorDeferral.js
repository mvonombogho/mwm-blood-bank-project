import mongoose from 'mongoose';

const DonorDeferralSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  deferralId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  deferralDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  deferralType: {
    type: String,
    enum: ['Temporary', 'Permanent'],
    required: true
  },
  deferralReason: {
    category: {
      type: String,
      enum: [
        'Medical',
        'Travel',
        'Medication',
        'Behavior',
        'Exposure',
        'Administrative',
        'Self',
        'Other'
      ],
      required: true
    },
    specificReason: {
      type: String,
      required: true
    },
    code: {
      type: String
    },
    description: {
      type: String
    }
  },
  deferralPeriod: {
    startDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    endDate: {
      type: Date
    },
    indefinite: {
      type: Boolean,
      default: false
    },
    duration: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        enum: ['Days', 'Weeks', 'Months', 'Years']
      }
    }
  },
  medicalData: {
    conditions: [{
      type: String
    }],
    labResults: [{
      test: {
        type: String
      },
      result: {
        type: String
      },
      date: {
        type: Date
      },
      notes: {
        type: String
      }
    }],
    medications: [{
      name: {
        type: String
      },
      dosage: {
        type: String
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      }
    }],
    notes: {
      type: String
    }
  },
  travelData: {
    countries: [{
      type: String
    }],
    regions: [{
      type: String
    }],
    departureDate: {
      type: Date
    },
    returnDate: {
      type: Date
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    notes: {
      type: String
    }
  },
  referrals: [{
    referralType: {
      type: String,
      enum: ['Primary Care', 'Specialist', 'Laboratory', 'Other']
    },
    referredTo: {
      type: String
    },
    referralDate: {
      type: Date
    },
    reason: {
      type: String
    },
    followUpDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'No Show']
    },
    outcome: {
      type: String
    },
    notes: {
      type: String
    }
  }],
  deferredBy: {
    staffId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  reviewData: {
    reviewRequired: {
      type: Boolean,
      default: false
    },
    reviewDate: {
      type: Date
    },
    reviewedBy: {
      type: String
    },
    reviewOutcome: {
      type: String,
      enum: ['Upheld', 'Modified', 'Removed']
    },
    reviewNotes: {
      type: String
    }
  },
  reinstatementData: {
    isReinstated: {
      type: Boolean,
      default: false
    },
    reinstatementDate: {
      type: Date
    },
    reinstatedBy: {
      staffId: {
        type: String
      },
      name: {
        type: String
      },
      role: {
        type: String
      }
    },
    reinstatementReason: {
      type: String
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date
    },
    notes: {
      type: String
    }
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationDate: {
    type: Date
  },
  notificationMethod: {
    type: String,
    enum: ['Email', 'SMS', 'Phone', 'Letter', 'In Person']
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Reinstated', 'Under Review'],
    default: 'Active'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for common queries
DonorDeferralSchema.index({ donorId: 1 });
DonorDeferralSchema.index({ status: 1 });
DonorDeferralSchema.index({ 'deferralPeriod.endDate': 1 });
DonorDeferralSchema.index({ deferralType: 1 });
DonorDeferralSchema.index({ 'deferralReason.category': 1 });

export default mongoose.models.DonorDeferral || mongoose.model('DonorDeferral', DonorDeferralSchema);