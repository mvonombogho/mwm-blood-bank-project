// This script updates all users to have inventory management permissions
// Run with: node scripts/update-user-permissions.js

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Simple version of User model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  permissions: {
    canManageDonors: { type: Boolean, default: false },
    canManageRecipients: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canViewSensitiveData: { type: Boolean, default: false }
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function updateUserPermissions() {
  try {
    // Update all users to have inventory management permissions
    const result = await User.updateMany(
      {}, // All users
      { 
        $set: { 
          'permissions.canManageInventory': true,
          'permissions.canViewInventory': true
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users with inventory management permissions`);
    
    // Verify updates
    const users = await User.find({});
    console.log('Current user permissions:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${JSON.stringify(user.permissions)}`);
    });
    
    // If needed, create an admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('No admin user found. Creating admin user...');
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@bloodbank.com',
        password: '$2a$10$e4MgIm/AOo2fW9oMxh8nIeufZGJqg1.t7GTVipIv.X1QJgy4dIkNC', // bcrypt hash for 'password123'
        role: 'admin',
        permissions: {
          canManageDonors: true,
          canManageRecipients: true,
          canManageInventory: true,
          canGenerateReports: true,
          canManageUsers: true,
          canViewSensitiveData: true
        }
      });
      
      await adminUser.save();
      console.log('Created admin user with email: admin@bloodbank.com and password: password123');
    }
    
  } catch (error) {
    console.error('Error updating user permissions:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the function
updateUserPermissions();