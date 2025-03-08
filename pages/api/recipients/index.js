import dbConnect from '@/lib/mongodb';
import Recipient from '@/models/Recipient';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET all recipients
    case 'GET':
      try {
        const recipients = await Recipient.find({});
        res.status(200).json(recipients);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // POST a new recipient
    case 'POST':
      try {
        // Check for existing recipient with same email or recipientId
        if (req.body.email) {
          const existingRecipientEmail = await Recipient.findOne({ email: req.body.email });
          if (existingRecipientEmail) {
            return res.status(400).json({ success: false, error: 'A recipient with this email already exists' });
          }
        }

        if (req.body.recipientId) {
          const existingRecipientId = await Recipient.findOne({ recipientId: req.body.recipientId });
          if (existingRecipientId) {
            return res.status(400).json({ success: false, error: 'A recipient with this ID already exists' });
          }
        }

        // Generate a unique recipientId if not provided
        if (!req.body.recipientId) {
          const date = new Date();
          const year = date.getFullYear().toString().slice(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const count = await Recipient.countDocuments({}) + 1;
          req.body.recipientId = `R${year}${month}${count.toString().padStart(4, '0')}`;
        }

        const recipient = await Recipient.create(req.body);
        res.status(201).json({ success: true, data: recipient });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}