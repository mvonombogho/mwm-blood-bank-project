import dbConnect from '../../../lib/mongodb';
import BloodUnit from '../../../models/BloodUnit';
import Donor from '../../../models/Donor';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    // Get current month start and end dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get total donations for the current month
    const totalDonations = await BloodUnit.countDocuments({
      collectionDate: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    });
    
    // Get number of unique donors who donated this month
    const donorsThisMonth = await BloodUnit.aggregate([
      {
        $match: {
          collectionDate: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      },
      {
        $group: {
          _id: '$donorId'
        }
      },
      {
        $count: 'uniqueDonors'
      }
    ]);
    
    const totalDonors = donorsThisMonth.length > 0 ? donorsThisMonth[0].uniqueDonors : 0;
    
    // Calculate average donations per day
    const daysPassed = Math.min(now.getDate(), lastDayOfMonth.getDate());
    const avgDonationsPerDay = daysPassed > 0 ? (totalDonations / daysPassed).toFixed(1) : 0;
    
    // Find most common blood type among donations
    const bloodTypeCounts = await BloodUnit.aggregate([
      {
        $match: {
          collectionDate: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    const mostCommonBloodType = bloodTypeCounts.length > 0 ? bloodTypeCounts[0]._id : 'N/A';
    
    // Get previous month data for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const prevMonthDonations = await BloodUnit.countDocuments({
      collectionDate: {
        $gte: prevMonthStart,
        $lte: prevMonthEnd
      }
    });
    
    // Calculate percentage change
    let percentageChange = 0;
    if (prevMonthDonations > 0) {
      percentageChange = (((totalDonations - prevMonthDonations) / prevMonthDonations) * 100).toFixed(1);
    }
    
    res.status(200).json({
      totalDonations,
      totalDonors,
      avgDonationsPerDay,
      mostCommonBloodType,
      percentageChange,
      prevMonthDonations,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating donation statistics report:', error);
    res.status(500).json({ 
      message: 'Failed to generate donation statistics report', 
      error: error.message 
    });
  }
}
