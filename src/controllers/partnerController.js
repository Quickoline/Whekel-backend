import Partner from '../models/Partner.js';

// Public / Candidate: Submit Partner Onboarding Application
export const applyPartner = async (req, res) => {
  try {
    const { name, email, phone, businessName, serviceType, location, additionalInfo } = req.body;

    const application = await Partner.create({
      name,
      email,
      phone,
      businessName,
      serviceType,
      location,
      additionalInfo: additionalInfo || '',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Onboarding application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Partner Applications (SuperAdmin / Service Admins)
export const getAllPartners = async (req, res) => {
  try {
    const { status, serviceType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const partners = await Partner.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: partners.length, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get Partner Application by ID
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner application not found' });
    }
    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Approval Desk: Update Status (pending, reviewing, approved, rejected)
export const updatePartnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner application not found' });
    }

    partner.status = status;
    const updated = await partner.save();

    res.json({ success: true, message: `Partner application updated to ${status}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Partner Application
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner application not found' });
    }
    res.json({ success: true, message: 'Partner application removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
