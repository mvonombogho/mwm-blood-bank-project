import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  contactId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contactType: {
    type: String,
    enum: ['Donor', 'Recipient', 'Hospital', 'Staff', 'Vendor', 'Other'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contactType'
  },
  primaryEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  secondaryEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  primaryPhone: {
    type: String,
    trim: true
  },
  secondaryPhone: {
    type: String,
    trim: true
  },
  address: {
    street: {
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
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  preferredContactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'SMS', 'Post', 'Any'],
    default: 'Email'
  },
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
    },
    optOutAll: {
      type: Boolean,
      default: false
    }
  },
  preferredContactTimes: {
    morning: {
      type: Boolean,
      default: true
    },
    afternoon: {
      type: Boolean,
      default: true
    },
    evening: {
      type: Boolean,
      default: true
    }
  },
  communicationHistory: [{
    communicationType: {
      type: String,
      enum: ['Email', 'SMS', 'Phone', 'Letter', 'InPerson', 'Other'],
      required: true
    },
    direction: {
      type: String,
      enum: ['Outgoing', 'Incoming'],
      default: 'Outgoing'
    },
    subject: {
      type: String,
      required: true
    },
    content: {
      type: String
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: String
    },
    status: {
      type: String,
      enum: ['Sent', 'Delivered', 'Read', 'Failed', 'Responded'],
      default: 'Sent'
    },
    response: {
      type: String
    },
    responseAt: {
      type: Date
    },
    attachments: [{
      name: {
        type: String
      },
      type: {
        type: String
      },
      url: {
        type: String
      }
    }],
    notes: {
      type: String
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Blocked', 'Bounced'],
    default: 'Active'
  },
  lastContactedDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for common queries
ContactSchema.index({ contactType: 1, relatedId: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ primaryEmail: 1 });
ContactSchema.index({ primaryPhone: 1 });
ContactSchema.index({ 'communicationHistory.sentAt': 1 });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);