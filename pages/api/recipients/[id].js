import dbConnect from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  // Validate if the ID is valid MongoDB ObjectId or a valid recipientId string
  let recipient;
  if (mongoose.Types.ObjectId.isValid(id)) {
    recipient = await Recipient.findById(id);
  } else {
    recipient = await Recipient.findOne({ recipientId: id });
  }

  if (!recipient) {
    return res.status(404).json({ success: false, error: 'Recipient not found' });
  }

  switch (method) {
    // GET recipient by ID
    case 'GET':
      try {
        res.status(200).json({ success: true, data: recipient });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // PUT (update) recipient
    case 'PUT':
      try {
        // Check if trying to update email and if it already exists for another recipient
        if (req.body.email && req.body.email !== recipient.email) {
          const existingEmail = await Recipient.findOne({ email: req.body.email });
          if (existingEmail && existingEmail._id.toString() !== id) {
            return res.status(400).json({ success: false, error: 'A recipient with this email already exists' });
          }
        }

        // Check if trying to update recipientId and if it already exists for another recipient
        if (req.body.recipientId && req.body.recipientId !== recipient.recipientId) {
          const existingId = await Recipient.findOne({ recipientId: req.body.recipientId });
          if (existingId && existingId._id.toString() !== id) {
            return res.status(400).json({ success: false, error: 'A recipient with this ID already exists' });
          }
        }

        // Update the recipient
        const updatedRecipient = await Recipient.findByIdAndUpdate(
          recipient._id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

        res.status(200).json({ success: true, data: updatedRecipient });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // DELETE recipient
    case 'DELETE':
      try {
        const deletedRecipient = await Recipient.deleteOne({ _id: recipient._id });
        
        if (deletedRecipient.deletedCount === 0) {
          return res.status(400).json({ success: false, error: 'Recipient could not be deleted' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}