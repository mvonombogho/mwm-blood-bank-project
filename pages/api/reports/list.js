import dbConnect from '../../../lib/dbConnect';
import Report from '../../../models/Report';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Get authenticated session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Connect to database
    await dbConnect();
    
    // Get filter parameters
    const { category, limit = 10, skip = 0 } = req.query;
    
    // Create filter object
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Query database for reports
    let reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    // If no reports are found, generate some default reports and store them
    if (reports.length === 0) {
      const defaultReports = [
        { 
          title: 'Monthly Donation Summary', 
          description: 'Overview of all donations for the current month',
          category: 'Donations',
          type: 'donation-statistics',
          viewPath: '/reports/donations/monthly',
          iconType: 'barChart',
          createdBy: session.user.id,
          data: generateDonationStatisticsData()
        },
        { 
          title: 'Blood Inventory Status', 
          description: 'Current inventory levels by blood type',
          category: 'Inventory',
          type: 'inventory-status',
          viewPath: '/reports/inventory/status',
          iconType: 'droplet',
          createdBy: session.user.id,
          data: generateInventoryStatusData()
        },
        { 
          title: 'Donor Demographics', 
          description: 'Age, gender, and blood type distribution of donors',
          category: 'Donors',
          type: 'donor-demographics',
          viewPath: '/reports/donors/demographics',
          iconType: 'users',
          createdBy: session.user.id,
          data: generateDonorDemographicsData()
        },
        { 
          title: 'Expiry Forecast', 
          description: 'Projection of blood units set to expire in the next 30 days',
          category: 'Inventory',
          type: 'expiry-forecast',
          viewPath: '/reports/inventory/expiry',
          iconType: 'calendar',
          createdBy: session.user.id,
          data: generateExpiryForecastData()
        }
      ];
      
      try {
        // Save default reports to database
        await Report.insertMany(defaultReports);
        
        // Fetch the newly created reports
        reports = await Report.find(filter)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .lean();
      } catch (insertError) {
        console.error('Error creating default reports:', insertError);
        // If we still have no reports, return empty array
        if (reports.length === 0) {
          return res.status(200).json({ reports: [] });
        }
      }
    }
    
    // Return the reports
    return res.status(200).json({
      reports: reports.map(report => ({
        ...report,
        id: report._id.toString(),
        lastGenerated: report.createdAt,
        endpoint: `/api/reports/download?report=${report.type}&id=${report._id}`
      }))
    });
  } catch (error) {
    console.error('Error fetching reports list:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch reports list', 
      error: error.message 
    });
  }
}

// Helper function to generate donation statistics data
function generateDonationStatisticsData() {
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

// Helper function to generate inventory status data
function generateInventoryStatusData() {
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

// Helper function to generate donor demographics data
function generateDonorDemographicsData() {
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

// Helper function to generate expiry forecast data
function generateExpiryForecastData() {
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