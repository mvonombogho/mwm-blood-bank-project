import dbConnect from '../../../lib/mongodb';
import Donor from '../../../models/Donor';
import BloodUnit from '../../../models/BloodUnit';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await dbConnect();

  try {
    // Calculate all stats in parallel for better performance
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalDonors, activeDonors, lastMonthActiveDonors, totalDonations, donationsThisMonth, 
           donationsLastMonth, bloodTypeDistribution, donationsByMonth] = await Promise.all([
      // Total donors count
      Donor.countDocuments(),
      
      // Active donors (donated in last 3 months)
      Donor.countDocuments({ lastDonation: { $gte: threeMonthsAgo } }),
      
      // Active donors last month (for change calculation)
      Donor.countDocuments({ lastDonation: { $gte: new Date(now.getFullYear(), now.getMonth() - 4, now.getDate()), 
                                              $lt: threeMonthsAgo } }),
      
      // Total donations count
      BloodUnit.countDocuments(),
      
      // Donations this month
      BloodUnit.countDocuments({ donationDate: { $gte: thisMonth } }),
      
      // Donations last month
      BloodUnit.countDocuments({ donationDate: { $gte: lastMonth, $lt: thisMonth } }),
      
      // Blood type distribution
      Donor.aggregate([
        { $group: { _id: '$bloodType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Donations by month (last 6 months)
      BloodUnit.aggregate([
        { 
          $match: { 
            donationDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$donationDate' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    // Format blood type distribution
    const formattedBloodTypeDistribution = {};
    bloodTypeDistribution.forEach((item) => {
      formattedBloodTypeDistribution[item._id || 'Unknown'] = item.count;
    });
    
    // Format donations by month
    const formattedDonationsByMonth = {};
    donationsByMonth.forEach((item) => {
      const [year, month] = item._id.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      formattedDonationsByMonth[monthName] = item.count;
    });
    
    // Calculate change percentages
    const activeDonorsChange = lastMonthActiveDonors > 0 
      ? ((activeDonors - lastMonthActiveDonors) / lastMonthActiveDonors) * 100 
      : 0;
      
    const donationsMonthlyChange = donationsLastMonth > 0 
      ? ((donationsThisMonth - donationsLastMonth) / donationsLastMonth) * 100 
      : 0;
    
    res.status(200).json({
      totalDonors,
      activeDonors,
      activeDonorsChange,
      totalDonations,
      donationsThisMonth,
      donationsLastMonth,
      donationsMonthlyChange,
      bloodTypeDistribution: formattedBloodTypeDistribution,
      donationsByMonth: formattedDonationsByMonth
    });
  } catch (error) {
    console.error('Error fetching donor stats:', error);
    res.status(500).json({ message: 'Error fetching donor statistics', error: error.message });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageDonors' });
