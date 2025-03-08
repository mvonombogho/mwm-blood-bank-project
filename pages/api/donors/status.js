import dbConnect from '@/lib/mongodb';
import Donor from '@/models/Donor';
import DonorHealth from '@/models/DonorHealth';
import DonorDeferral from '@/models/DonorDeferral';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET donor status
    case 'GET':
      try {
        const { donorId } = req.query;
        
        if (!donorId) {
          return res.status(400).json({ success: false, error: 'donorId is required' });
        }
        
        // Find the donor
        let donor;
        if (mongoose.Types.ObjectId.isValid(donorId)) {
          donor = await Donor.findById(donorId);
        } else {
          donor = await Donor.findOne({ donorId });
        }
        
        if (!donor) {
          return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        
        // Get donor health data
        const donorHealth = await DonorHealth.findOne({ donorId: donor._id });
        
        // Get active deferrals
        const activeDeferal = await DonorDeferral.findOne({ 
          donorId: donor._id,
          status: 'Active'
        }).sort({ deferralDate: -1 });
        
        // Calculate days since last donation
        let daysSinceLastDonation = null;
        if (donor.lastDonationDate) {
          const lastDonation = new Date(donor.lastDonationDate);
          const today = new Date();
          const diffTime = Math.abs(today - lastDonation);
          daysSinceLastDonation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Calculate eligibility
        let eligibilityStatus = {
          isEligible: true,
          reason: null,
          nextEligibleDate: null
        };
        
        // Check for active deferral
        if (activeDeferal) {
          eligibilityStatus.isEligible = false;
          eligibilityStatus.reason = `Deferred: ${activeDeferal.deferralReason.specificReason}`;
          
          if (activeDeferal.deferralPeriod.endDate) {
            eligibilityStatus.nextEligibleDate = activeDeferal.deferralPeriod.endDate;
          } else if (activeDeferal.deferralType === 'Permanent') {
            eligibilityStatus.reason = 'Permanently deferred';
          }
        } 
        // Check donor's status
        else if (donor.status !== 'Active') {
          eligibilityStatus.isEligible = false;
          eligibilityStatus.reason = `Donor status: ${donor.status}`;
        }
        // Check minimum days between donations (56 days / 8 weeks for whole blood)
        else if (daysSinceLastDonation !== null && daysSinceLastDonation < 56) {
          eligibilityStatus.isEligible = false;
          eligibilityStatus.reason = 'Minimum interval between donations not met';
          
          const lastDonation = new Date(donor.lastDonationDate);
          const nextEligible = new Date(lastDonation);
          nextEligible.setDate(nextEligible.getDate() + 56);
          eligibilityStatus.nextEligibleDate = nextEligible;
        }
        // Check health parameters if available
        else if (donorHealth && donorHealth.eligibilityStatus) {
          if (!donorHealth.eligibilityStatus.isEligible) {
            eligibilityStatus.isEligible = false;
            eligibilityStatus.reason = donorHealth.eligibilityStatus.deferralReason || 'Health parameters not within acceptable range';
            eligibilityStatus.nextEligibleDate = donorHealth.eligibilityStatus.nextEligibleDate;
          }
        }
        
        // Prepare the response
        const donorStatus = {
          donor: {
            _id: donor._id,
            donorId: donor.donorId,
            firstName: donor.firstName,
            lastName: donor.lastName,
            bloodType: donor.bloodType,
            status: donor.status,
            donationCount: donor.donationCount,
            lastDonationDate: donor.lastDonationDate
          },
          eligibility: eligibilityStatus,
          healthStatus: donorHealth ? {
            lastAssessment: donorHealth.eligibilityStatus?.lastAssessmentDate,
            status: donorHealth.eligibilityStatus?.isEligible ? 'Eligible' : 'Ineligible',
            permanentlyDeferred: donorHealth.eligibilityStatus?.permanentlyDeferred,
            latestParameters: donorHealth.healthParameters && donorHealth.healthParameters.length > 0 ?
              donorHealth.healthParameters.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null
          } : null,
          activeDeferral: activeDeferal ? {
            deferralId: activeDeferal.deferralId,
            deferralType: activeDeferal.deferralType,
            deferralReason: activeDeferal.deferralReason,
            startDate: activeDeferal.deferralPeriod.startDate,
            endDate: activeDeferal.deferralPeriod.endDate,
            indefinite: activeDeferal.deferralPeriod.indefinite
          } : null,
          donationMetrics: {
            totalDonations: donor.donationCount || 0,
            daysSinceLastDonation,
            intervalCompliance: daysSinceLastDonation === null || daysSinceLastDonation >= 56
          }
        };
        
        res.status(200).json({ success: true, data: donorStatus });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
}