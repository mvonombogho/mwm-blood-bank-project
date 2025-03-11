import dbConnect from '../../../../lib/mongodb';
import Donor from '../../../../models/Donor';
import withAuth from '../../../../lib/middlewares/withAuth';

async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

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
        console.error(`Error fetching donor ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid donor ID format' });
        }
        
        res.status(500).json({ message: 'Error fetching donor', error: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const donor = await Donor.findById(id);
        
        if (!donor) {
          return res.status(404).json({ message: 'Donor not found' });
        }
        
        // Update donor with new data
        Object.keys(req.body).forEach((key) => {
          donor[key] = req.body[key];
        });
        
        await donor.save();
        res.status(200).json(donor);
      } catch (error) {
        console.error(`Error updating donor ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid donor ID format' });
        }
        
        if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {});
          
          return res.status(400).json({ message: 'Validation error', errors });
        }
        
        res.status(500).json({ message: 'Error updating donor', error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        const deletedDonor = await Donor.findByIdAndDelete(id);
        
        if (!deletedDonor) {
          return res.status(404).json({ message: 'Donor not found' });
        }
        
        res.status(200).json({ message: 'Donor deleted successfully' });
      } catch (error) {
        console.error(`Error deleting donor ${id}:`, error);
        
        if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid donor ID format' });
        }
        
        res.status(500).json({ message: 'Error deleting donor', error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler, { requiredPermission: 'canManageDonors' });
