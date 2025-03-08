import dbConnect from '@/lib/mongodb';
import Donor from '@/models/Donor';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all donors
    case 'GET':
      try {
        const donors = await Donor.find({});
        res.status(200).json(donors);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new donor
    case 'POST':
      try {
        // Check for existing donor with same email or donorId
        if (req.body.email) {
          const existingDonorEmail = await Donor.findOne({ email: req.body.email });
          if (existingDonorEmail) {
            return res.status(400).json({ success: false, error: 'A donor with this email already exists' });
          }
        }

        if (req.body.donorId) {
          const existingDonorId = await Donor.findOne({ donorId: req.body.donorId });
          if (existingDonorId) {
            return res.status(400).json({ success: false, error: 'A donor with this ID already exists' });
          }
        }

        // Generate a unique donorId if not provided
        if (!req.body.donorId) {
          const date = new Date();
          const year = date.getFullYear().toString().slice(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const count = await Donor.countDocuments({}) + 1;
          req.body.donorId = `D${year}${month}${count.toString().padStart(4, '0')}`;
        }

        const donor = await Donor.create(req.body);
        res.status(201).json({ success: true, data: donor });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}