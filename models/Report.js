import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'donation-statistics', 
        'inventory-status', 
        'donor-demographics', 
        'expiry-forecast',
        'custom'
      ]
    },
    category: {
      type: String,
      required: true,
      enum: ['Donations', 'Inventory', 'Donors', 'Recipients', 'Other']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parameters: {
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      bloodTypes: [{
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      }],
      additionalFilters: {
        type: Map,
        of: String
      }
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['generated', 'failed', 'generating'],
      default: 'generated'
    },
    iconType: {
      type: String,
      enum: ['barChart', 'pieChart', 'calendar', 'users', 'droplet', 'list'],
      default: 'barChart'
    },
    viewPath: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Indexes for frequently queried fields
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ type: 1 });
ReportSchema.index({ category: 1 });
ReportSchema.index({ createdBy: 1 });

// Virtual for formatted date
ReportSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Add method to get download URL
ReportSchema.methods.getDownloadUrl = function(format = 'pdf') {
  return `/api/reports/download?report=${this.type}&id=${this._id}&format=${format}`;
};

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
