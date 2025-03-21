/**
 * Script to seed the database with sample blood units
 * Run with: node scripts/seed-blood-units.js
 */

import { connectToDatabase } from '../lib/mongodb.js';
import BloodUnit from '../models/BloodUnit.js';
import Donor from '../models/Donor.js';
import mongoose from 'mongoose';

async function seedBloodUnits() {
  console.log('Connecting to database...');
  await connectToDatabase();
  
  try {
    // First, check if we have any donors to use
    const donorCount = await Donor.countDocuments();
    
    let donorIds;
    
    if (donorCount === 0) {
      // If no donors exist, create a test donor
      const testDonor = new Donor({
        donorId: 'D-TEST-001',
        firstName: 'Test',
        lastName: 'Donor',
        gender: 'Male',
        dateOfBirth: new Date('1990-01-01'),
        bloodType: 'O+',
        rhFactor: 'Positive',
        contactDetails: {
          email: 'test@example.com',
          phone: '1234567890',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'Test Country'
          }
        },
        status: 'Active'
      });
      
      await testDonor.save();
      donorIds = [testDonor._id];
      console.log('Created test donor:', testDonor.donorId);
    } else {
      // Get all donor IDs
      const donors = await Donor.find().select('_id');
      donorIds = donors.map(donor => donor._id);
      console.log(`Found ${donorIds.length} donors`);
    }
    
    // Create blood units for each blood type
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const statuses = ['Available', 'Reserved', 'Quarantined'];
    const facilities = ['Main Facility', 'North Branch', 'South Branch'];
    const storageUnits = ['Refrigerator 1', 'Freezer 2', 'Cold Storage 3'];
    
    console.log('Creating blood units...');
    
    const bloodUnits = [];
    const now = new Date();
    
    // Generate 50 blood units
    for (let i = 0; i < 50; i++) {
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const facility = facilities[Math.floor(Math.random() * facilities.length)];
      const storageUnit = storageUnits[Math.floor(Math.random() * storageUnits.length)];
      const donorId = donorIds[Math.floor(Math.random() * donorIds.length)];
      
      // Collection date between 1-30 days ago
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const collectionDate = new Date(now);
      collectionDate.setDate(collectionDate.getDate() - daysAgo);
      
      // Expiration date 42 days after collection for whole blood
      const expirationDate = new Date(collectionDate);
      expirationDate.setDate(expirationDate.getDate() + 42);
      
      const bloodUnit = {
        unitId: `BU-${bloodType.replace('+', 'P').replace('-', 'N')}-${1000 + i}`,
        donorId,
        bloodType,
        collectionDate,
        expirationDate,
        quantity: 450, // Standard donation in ml
        status,
        location: {
          facility,
          storageUnit,
          shelf: `Shelf ${Math.floor(Math.random() * 5) + 1}`,
          position: `Pos ${Math.floor(Math.random() * 10) + 1}`
        },
        processingDetails: {
          processMethod: 'Whole Blood',
          processedDate: collectionDate,
          testResults: {
            hiv: false,
            hepatitisB: false,
            hepatitisC: false,
            syphilis: false,
            malaria: false
          }
        },
        statusHistory: [
          {
            status: 'Quarantined',
            date: collectionDate,
            updatedBy: 'System',
            notes: 'Initial status after collection'
          },
          {
            status,
            date: new Date(collectionDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after collection
            updatedBy: 'System',
            notes: 'Status updated after testing'
          }
        ],
        notes: `Sample blood unit created for testing`
      };
      
      bloodUnits.push(bloodUnit);
    }
    
    // Insert all blood units
    const result = await BloodUnit.insertMany(bloodUnits);
    console.log(`Successfully inserted ${result.length} blood units`);
    
    // Count total units by status
    const counts = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Blood unit counts by status:');
    counts.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding blood units:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedBloodUnits();
