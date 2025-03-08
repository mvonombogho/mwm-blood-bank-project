import mongoose from 'mongoose';

const DonorHealthSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  healthParameters: [{
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    weight: { // in kg
      type: Number
    },
    height: { // in cm
      type: Number
    },
    bmi: {
      type: Number
    },
    bloodPressure: {
      systolic: {
        type: Number
      },
      diastolic: {
        type: Number
      }
    },
    pulse: { // in bpm
      type: Number
    },
    temperature: { // in celsius
      type: Number
    },
    hemoglobin: { // in g/dL
      type: Number
    },
    hematocrit: { // in percentage
      type: Number
    },
    plateletCount: { // in thousands/μL
      type: Number
    },
    ironLevel: { // in μg/dL
      type: Number
    },
    bloodGlucose: { // in mg/dL
      type: Number
    },
    status: {
      type: String,
      enum: ['Normal', 'Attention Required', 'Deferred'],
      default: 'Normal'
    },
    notes: {
      type: String
    }
  }],
  medicalHistory: {
    allergies: [{
      type: String
    }],
    chronicConditions: [{
      condition: {
        type: String
      },
      diagnosedYear: {
        type: Number
      },
      medications: [{
        type: String
      }],
      notes: {
        type: String
      }
    }],
    surgeries: [{
      procedure: {
        type: String
      },
      year: {
        type: Number
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
      frequency: {
        type: String
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      purpose: {
        type: String
      }
    }],
    vaccinations: [{
      name: {
        type: String
      },
      date: {
        type: Date
      },
      validUntil: {
        type: Date
      }
    }],
    bloodTransfusions: [{
      date: {
        type: Date
      },
      reason: {
        type: String
      }
    }],
    pregnancies: [{
      year: {
        type: Number
      },
      complications: {
        type: String
      }
    }],
    familyHistory: {
      type: String
    }
  },
  riskAssessment: {
    travelHistory: [{
      country: {
        type: String
      },
      fromDate: {
        type: Date
      },
      toDate: {
        type: Date
      },
      riskLevel: {
        type: String,
        enum: ['None', 'Low', 'Medium', 'High'],
        default: 'None'
      },
      notes: {
        type: String
      }
    }],
    behavioralRisks: [{
      riskType: {
        type: String
      },
      assessmentDate: {
        type: Date
      },
      riskLevel: {
        type: String,
        enum: ['None', 'Low', 'Medium', 'High'],
        default: 'None'
      },
      notes: {
        type: String
      }
    }],
    exposureRisks: [{
      exposureType: {
        type: String
      },
      exposureDate: {
        type: Date
      },
      riskLevel: {
        type: String,
        enum: ['None', 'Low', 'Medium', 'High'],
        default: 'None'
      },
      notes: {
        type: String
      }
    }],
    overallRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low'
    }
  },
  eligibilityStatus: {
    isEligible: {
      type: Boolean,
      default: true
    },
    lastAssessmentDate: {
      type: Date,
      default: Date.now
    },
    nextEligibleDate: {
      type: Date
    },
    permanentlyDeferred: {
      type: Boolean,
      default: false
    },
    deferralReason: {
      type: String
    },
    notes: {
      type: String
    }
  },
  donationReactions: [{
    donationDate: {
      type: Date,
      required: true
    },
    reactionType: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe'],
      default: 'None'
    },
    symptoms: [{
      type: String
    }],
    treatment: {
      type: String
    },
    resolution: {
      type: String,
      enum: ['Resolved', 'Ongoing', 'Required Medical Attention'],
      default: 'Resolved'
    },
    preventiveMeasures: {
      type: String
    },
    notes: {
      type: String
    }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for common queries
DonorHealthSchema.index({ donorId: 1 });
DonorHealthSchema.index({ 'eligibilityStatus.isEligible': 1 });
DonorHealthSchema.index({ 'eligibilityStatus.nextEligibleDate': 1 });
DonorHealthSchema.index({ 'healthParameters.date': 1 });
DonorHealthSchema.index({ 'riskAssessment.overallRiskLevel': 1 });

export default mongoose.models.DonorHealth || mongoose.model('DonorHealth', DonorHealthSchema);