import { connectToDatabase } from '../../../lib/mongodb';
import Report from '../../../models/Report';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();
    
    const { type, startDate, endDate } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Report type is required' });
    }
    
    // Generate the appropriate report data
    let reportData;
    let title;
    let description;
    let category;
    let iconType;
    let viewPath;
    
    switch (type) {
      case 'inventory-status':
        reportData = await generateInventoryStatusReport();
        title = 'Blood Inventory Status';
        description = 'Current inventory levels by blood type';
        category = 'Inventory';
        iconType = 'droplet';
        viewPath = '/reports/inventory/status';
        break;
        
      case 'donation-statistics':
        reportData = await generateDonationStatisticsReport();
        title = 'Monthly Donation Statistics';
        description = 'Overview of all donations for the current month';
        category = 'Donations';
        iconType = 'barChart';
        viewPath = '/reports/donations/monthly';
        break;
        
      case 'donor-demographics':
        reportData = await generateDonorDemographicsReport();
        title = 'Donor Demographics';
        description = 'Age, gender, and blood type distribution of donors';
        category = 'Donors';
        iconType = 'users';
        viewPath = '/reports/donors/demographics';
        break;
        
      case 'expiry-forecast':
        reportData = await generateExpiryForecastReport();
        title = 'Blood Unit Expiry Forecast';
        description = 'Projection of blood units set to expire in the next 30 days';
        category = 'Inventory';
        iconType = 'calendar';
        viewPath = '/reports/inventory/expiry';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Create parameters object for the report
    const parameters = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    };
    
    // Create a new report in the database
    const report = new Report({
      title,
      description,
      type,
      category,
      createdBy: session.user.id,
      parameters,
      data: reportData,
      iconType,
      viewPath,
      status: 'generated'
    });
    
    await report.save();
    
    res.status(201).json({
      id: report._id,
      message: 'Report generated successfully'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      message: 'Failed to generate report', 
      error: error.message 
    });
  }
}

// Mock function to generate inventory status report
async function generateInventoryStatusReport() {
  return {
    title: 'Blood Inventory Status',
    generatedAt: new Date().toISOString(),
    totalAvailable: 1234,
    criticalLevels: 3,
    expiringUnits: 28,
    storageCapacity: '78%',
    bloodTypeDistribution: {
      'A+': 320,
      'A-': 85,
      'B+': 280,
      'B-': 75,
      'AB+': 98,
      'AB-': 25,
      'O+': 300,
      'O-': 51
    }
  };
}

// Mock function to generate donation statistics report
async function generateDonationStatisticsReport() {
  return {
    title: 'Monthly Donation Statistics',
    generatedAt: new Date().toISOString(),
    period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    totalDonations: 245,
    totalDonors: 189,
    avgDonationsPerDay: 8.2,
    mostCommonBloodType: 'O+',
    percentageChange: '+5.2%' 
  };
}

// Mock function to generate donor demographics report
async function generateDonorDemographicsReport() {
  return {
    title: 'Donor Demographics',
    generatedAt: new Date().toISOString(),
    totalDonors: 1543,
    ageDistribution: {
      '18-25': 230,
      '26-35': 450,
      '36-45': 380,
      '46-55': 320,
      '56+': 163
    },
    genderDistribution: {
      'Male': 825,
      'Female': 718
    },
    bloodTypeDistribution: {
      'A+': 420,
      'A-': 95,
      'B+': 300,
      'B-': 85,
      'AB+': 120,
      'AB-': 35,
      'O+': 400,
      'O-': 88
    }
  };
}

// Mock function to generate expiry forecast report
async function generateExpiryForecastReport() {
  return {
    title: 'Blood Unit Expiry Forecast',
    generatedAt: new Date().toISOString(),
    expiringIn7Days: 28,
    expiringIn30Days: 92,
    expiryByBloodType: {
      'A+': 10,
      'A-': 3,
      'B+': 8,
      'B-': 2,
      'AB+': 5,
      'AB-': 1,
      'O+': 11,
      'O-': 2
    }
  };
}