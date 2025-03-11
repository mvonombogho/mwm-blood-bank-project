import dbConnect from '../../../../lib/mongodb';
import Donor from '../../../../models/Donor';
import BloodUnit from '../../../../models/BloodUnit';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }

  try {
    // First check if donor exists
    const donor = await Donor.findById(id);
    
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    
    // Get all blood units donated by this donor
    const donations = await BloodUnit.find({ donorId: id })
      .sort({ donationDate: -1 }); // Sort by donation date, newest first
    
    res.status(200).json(donations);
  } catch (error) {
    console.error(`Error fetching donations for donor ${id}:`, error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid donor ID format' });
    }
    
    res.status(500).json({ message: 'Error fetching donor donations', error: error.message });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageDonors' });
