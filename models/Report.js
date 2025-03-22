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
    category: {
      type: String,
      enum: ['Donations', 'Inventory', 'Donors', 'Recipients'],
      required: true
    },
    type: {
      type: String,
      enum: [
        'donation-statistics', 
        'inventory-status', 
        'donor-demographics', 
        'expiry-forecast',
        'inventory-summary', 
        'expiry-analysis', 
        'historical-trends', 
        'storage-conditions', 
        'critical-shortage'
      ],
      required: true
    },
    viewPath: {
      type: String,
      required: true
    },
    iconType: {
      type: String,
      enum: ['barChart', 'pieChart', 'calendar', 'users', 'droplet', 'list'],
      default: 'barChart'
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv'],
      default: 'pdf'
    },
    timeRange: {
      type: String
    },
    parameters: {
      bloodTypes: [{
        type: String,
        enum: ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      }],
      includeOptions: [{
        type: String
      }],
      // Additional parameters can be stored here
      otherParams: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    },
    filePath: {
      type: String
    },
    fileSize: {
      type: Number
    },
    fileUrl: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    error: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for common queries
ReportSchema.index({ type: 1 });
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ status: 1 });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);