import mongoose from 'mongoose';

// Define the schema
const DonorSchema = new mongoose.Schema(
  {
    donorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood type is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    occupation: {
      type: String,
      trim: true
    },
    emergencyContactName: {
      type: String,
      trim: true
    },
    emergencyContactPhone: {
      type: String,
      trim: true
    },
    emergencyContactRelationship: {
      type: String,
      trim: true
    },
    weight: {
      type: Number
    },
    height: {
      type: Number
    },
    hasRecentIllness: {
      type: Boolean,
      default: false
    },
    recentIllnessDetails: {
      type: String
    },
    hasChronicDisease: {
      type: Boolean,
      default: false
    },
    chronicDiseaseDetails: {
      type: String
    },
    isTakingMedication: {
      type: Boolean,
      default: false
    },
    medicationDetails: {
      type: String
    },
    hasTraveledRecently: {
      type: Boolean,
      default: false
    },
    travelDetails: {
      type: String
    },
    hasPreviousDonation: {
      type: Boolean,
      default: false
    },
    previousDonationDetails: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'deferred', 'ineligible'],
      default: 'pending'
    },
    hasConsented: {
      type: Boolean,
      required: [true, 'Consent is required']
    },
    lastDonationDate: {
      type: Date
    },
    donationCount: {
      type: Number,
      default: 0
    },
    donations: [{
      date: {
        type: Date,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      notes: {
        type: String
      }
    }]
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Auto-generate donor ID before saving
DonorSchema.pre('save', async function(next) {
  // Only generate ID if it doesn't already exist
  if (!this.donorId) {
    // Get current year
    const currentYear = new Date().getFullYear().toString().substr(-2);
    
    // Find the highest existing donor ID for this year
    const highestDonorDoc = await this.constructor.findOne(
      { donorId: new RegExp('^D' + currentYear + '-') },
      { donorId: 1 },
      { sort: { donorId: -1 } }
    );
    
    let nextNumber = 1;
    
    // If there are existing donors this year, increment the number
    if (highestDonorDoc && highestDonorDoc.donorId) {
      const currentNumber = parseInt(highestDonorDoc.donorId.split('-')[1], 10);
      nextNumber = currentNumber + 1;
    }
    
    // Format: D{YY}-{SEQUENCE}
    this.donorId = `D${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
  }
  
  next();
});

// Add compound index for name search
DonorSchema.index({ firstName: 1, lastName: 1 });

// Add index for blood type
DonorSchema.index({ bloodType: 1 });

// Add index for status
DonorSchema.index({ status: 1 });

// Create and export the model
export default mongoose.models.Donor || mongoose.model('Donor', DonorSchema);