import dbConnect from '../../../lib/mongodb';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();
  
  const { report, format = 'json' } = req.query;
  
  if (!report) {
    return res.status(400).json({ message: 'Report type is required' });
  }
  
  try {
    let reportData;
    let fileName;
    
    // Fetch the appropriate report data based on the type
    switch (report) {
      case 'inventory-status':
        // We would normally call a service here to generate the report
        // This method mocks that process
        reportData = await generateInventoryStatusReport();
        fileName = 'inventory_status_report';
        break;
        
      case 'donation-statistics':
        reportData = await generateDonationStatisticsReport();
        fileName = 'donation_statistics_report';
        break;
        
      case 'donor-demographics':
        reportData = await generateDonorDemographicsReport();
        fileName = 'donor_demographics_report';
        break;
        
      case 'expiry-forecast':
        reportData = await generateExpiryForecastReport();
        fileName = 'expiry_forecast_report';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Set appropriate headers based on format
    const date = new Date().toISOString().split('T')[0];
    
    switch (format.toLowerCase()) {
      case 'csv':
        // Convert data to CSV
        const csv = convertToCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}_${date}.csv`);
        return res.status(200).send(csv);
        
      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}_${date}.json`);
        return res.status(200).json(reportData);
    }
  } catch (error) {
    console.error(`Error generating ${req.query.report} report:`, error);
    res.status(500).json({ 
      message: `Failed to generate ${req.query.report} report`, 
      error: error.message 
    });
  }
}

// Mock function to generate inventory status report
async function generateInventoryStatusReport() {
  // In a real application, this would query the database
  // We're using a service function pattern that would be reused by other endpoints
  return {
    report: {
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
    }
  };
}

// Mock function to generate donation statistics report
async function generateDonationStatisticsReport() {
  return {
    report: {
      title: 'Monthly Donation Statistics',
      generatedAt: new Date().toISOString(),
      period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      totalDonations: 245,
      totalDonors: 189,
      avgDonationsPerDay: 8.2,
      mostCommonBloodType: 'O+',
      percentageChange: '+5.2%' 
    }
  };
}

// Mock function to generate donor demographics report
async function generateDonorDemographicsReport() {
  return {
    report: {
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
    }
  };
}

// Mock function to generate expiry forecast report
async function generateExpiryForecastReport() {
  return {
    report: {
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
    }
  };
}

// Helper function to convert JSON to CSV
function convertToCSV(jsonData) {
  const report = jsonData.report;
  let csv = '';
  
  // Add report title and generation date
  csv += `${report.title}\n`;
  csv += `Generated at,${report.generatedAt}\n\n`;
  
  // Convert the main report data
  const reportEntries = Object.entries(report)
    .filter(([key]) => !['title', 'generatedAt'].includes(key) && typeof report[key] !== 'object');
  
  if (reportEntries.length > 0) {
    csv += reportEntries.map(([key, value]) => `${key},${value}`).join('\n') + '\n\n';
  }
  
  // Handle nested objects (distributions)
  Object.entries(report)
    .filter(([key, value]) => typeof value === 'object')
    .forEach(([key, distribution]) => {
      csv += `${key}\n`;
      csv += 'Category,Count\n';
      Object.entries(distribution).forEach(([category, count]) => {
        csv += `${category},${count}\n`;
      });
      csv += '\n';
    });
  
  return csv;
}
