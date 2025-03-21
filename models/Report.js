import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['inventory-summary', 'expiry-analysis', 'historical-trends', 'storage-conditions', 'critical-shortage'],
      required: true
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv'],
      required: true
    },
    timeRange: {
      type: String,
      required: true
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
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
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