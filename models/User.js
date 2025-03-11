import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'technician', 'staff', 'donor_coordinator'],
      default: 'staff'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    department: {
      type: String,
      trim: true
    },
    contactNumber: {
      type: String,
      trim: true
    },
    lastLogin: {
      type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    permissions: {
      canManageDonors: { type: Boolean, default: false },
      canManageRecipients: { type: Boolean, default: false },
      canManageInventory: { type: Boolean, default: false },
      canGenerateReports: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewSensitiveData: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Set permissions based on role - executed before save
UserSchema.pre('save', function(next) {
  // Skip if password isn't modified when updating
  if (!this.isModified('role')) return next();
  
  // Set permissions based on role
  switch (this.role) {
    case 'admin':
      this.permissions = {
        canManageDonors: true,
        canManageRecipients: true,
        canManageInventory: true,
        canGenerateReports: true,
        canManageUsers: true,
        canViewSensitiveData: true
      };
      break;
    case 'manager':
      this.permissions = {
        canManageDonors: true,
        canManageRecipients: true,
        canManageInventory: true,
        canGenerateReports: true,
        canManageUsers: false,
        canViewSensitiveData: true
      };
      break;
    case 'technician':
      this.permissions = {
        canManageDonors: false,
        canManageRecipients: false,
        canManageInventory: true,
        canGenerateReports: false,
        canManageUsers: false,
        canViewSensitiveData: false
      };
      break;
    case 'donor_coordinator':
      this.permissions = {
        canManageDonors: true,
        canManageRecipients: false,
        canManageInventory: false,
        canGenerateReports: true,
        canManageUsers: false,
        canViewSensitiveData: false
      };
      break;
    default: // staff
      this.permissions = {
        canManageDonors: false,
        canManageRecipients: false,
        canManageInventory: false,
        canGenerateReports: false,
        canManageUsers: false,
        canViewSensitiveData: false
      };
  }
  
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Skip if password isn't modified when updating
  if (!this.isModified('password')) return next();
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hash
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token for password reset
UserSchema.methods.getResetPasswordToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set token expiry (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
