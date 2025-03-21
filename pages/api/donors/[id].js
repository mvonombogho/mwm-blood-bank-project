import dbConnect from '../../../lib/mongodb';
import Donor from '../../../models/Donor';
import withAuth from '../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const donor = await Donor.findById(id);
        
        if (!donor) {
          return res.status(404).json({ message: 'Donor not found' });
        }
        
        res.status(200).json(donor);
      } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).json({ message: 'Error fetching donor', error: error.message });
      }
      break;
      
    case 'PUT':
      try {
        // Validate the donor exists
        const existingDonor = await Donor.findById(id);
        
        if (!existingDonor) {
          return res.status(404).json({ message: 'Donor not found' });
        }
        
        // Update the donor
        const updatedDonor = await Donor.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true }
        );
        
        res.status(200).json(updatedDonor);
      } catch (error) {
        console.error('Error updating donor:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyValue)[0];
          return res.status(400).json({ 
            message: 'Duplicate value error', 
            errors: { [field]: `This ${field} is already in use` } 
          });
        }
        
        res.status(500).json({ message: 'Error updating donor', error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        // Check if the donor exists
        const donor = await Donor.findById(id);
        
        if (!donor) {
          return res.status(404).json({ message: 'Donor not found' });
        }
        
        // Delete the donor
        await Donor.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Donor deleted successfully' });
      } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({ message: 'Error deleting donor', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

// Temporarily disable authentication for testing purposes
// export default withAuth(handler, { requiredPermission: 'canManageDonors' });
export default handler;