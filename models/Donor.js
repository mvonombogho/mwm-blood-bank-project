import mongoose from 'mongoose';

// Define the schema
const DonorSchema = new mongoose.Schema(
  {
    donorId: {
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
      required: true,
      unique: true,
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
    status: {
      type: String,
      enum: ['Active', 'Deferred', 'Inactive'],
      default: 'Active'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    lastDonationDate: {
      type: Date
    },
    donationCount: {
      type: Number,
      default: 0
    },
    donations: [{
      donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodUnit'
      },
      date: {
        type: Date,
        required: true
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
      location: {
        type: String,
        required: true
      },
      notes: {
        type: String
      }
    }],
    communicationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      phone: {
        type: Boolean,
        default: true
      },
      post: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Add compound index for name search
DonorSchema.index({ firstName: 1, lastName: 1 });

// Add index for blood type
DonorSchema.index({ bloodType: 1 });

// Add index for status
DonorSchema.index({ status: 1 });

// Create and export the model
export default mongoose.models.Donor || mongoose.model('Donor', DonorSchema);