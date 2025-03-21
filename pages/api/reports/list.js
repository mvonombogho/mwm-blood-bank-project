import dbConnect from '../../../lib/mongodb';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();
  
  // We would typically fetch report metadata from a database
  // For now, we'll return some pre-defined report types with real API endpoints
  try {
    const reports = [
      { 
        id: 1, 
        title: 'Monthly Donation Summary', 
        description: 'Overview of all donations for the current month',
        category: 'Donations',
        lastGenerated: new Date().toISOString(),
        endpoint: '/api/reports/donation-statistics',
        viewPath: '/reports/donations/monthly',
        iconType: 'barChart'
      },
      { 
        id: 2, 
        title: 'Blood Inventory Status', 
        description: 'Current inventory levels by blood type',
        category: 'Inventory',
        lastGenerated: new Date().toISOString(),
        endpoint: '/api/reports/inventory-status',
        viewPath: '/reports/inventory/status',
        iconType: 'droplet'
      },
      { 
        id: 3, 
        title: 'Donor Demographics', 
        description: 'Age, gender, and blood type distribution of donors',
        category: 'Donors',
        lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endpoint: '/api/reports/donor-demographics',
        viewPath: '/reports/donors/demographics',
        iconType: 'users'
      },
      { 
        id: 4, 
        title: 'Expiry Forecast', 
        description: 'Projection of blood units set to expire in the next 30 days',
        category: 'Inventory',
        lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endpoint: '/api/reports/expiry-forecast',
        viewPath: '/reports/inventory/expiry',
        iconType: 'calendar'
      }
    ];
    
    // Filter by category if requested
    let filteredReports = reports;
    if (req.query.category && req.query.category !== 'all') {
      filteredReports = reports.filter(report => 
        report.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    res.status(200).json({
      reports: filteredReports
    });
  } catch (error) {
    console.error('Error fetching reports list:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reports list', 
      error: error.message 
    });
  }
}
