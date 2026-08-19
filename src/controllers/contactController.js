import Contact from '../models/Contact.js';

// Submit Contact / Support Inquiry
export const submitContactInquiry = async (req, res) => {
  try {
    const { name, email, subject, message, role } = req.body;

    const inquiry = await Contact.create({
      name,
      email,
      subject,
      message,
      role: role || 'user',
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Support inquiry submitted successfully. Our team will contact you shortly.',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Support Inquiries
export const getAllInquiriesAdmin = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    const inquiries = await Contact.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Resolve Inquiry / Update Status & Notes
export const updateInquiryAdmin = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const inquiry = await Contact.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Support inquiry not found' });
    }

    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

    const updated = await inquiry.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Inquiry
export const deleteInquiryAdmin = async (req, res) => {
  try {
    const inquiry = await Contact.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
