import GeneralInfo from '../models/GeneralInfo.js';

export const getGeneralInfo = async (req, res) => {
  try {
    let info = await GeneralInfo.findOne();
    if (!info) {
      info = await GeneralInfo.create({
        title: 'Whekel Mobility',
        tagline: 'All In One Transport & Mobility App',
        categories: ['Ride', 'Parcel', 'Freight', 'Vendor'],
        steps: [
          { stepNumber: 1, title: 'Discover', description: 'Explore structured categories for Rides, Parcels, Freight, and Emergency Vendors.' },
          { stepNumber: 2, title: 'Book & Negotiate', description: 'Order context threads with transparent fare estimation and driver negotiation.' },
          { stepNumber: 3, title: 'Pay & Track', description: 'Transparent wallet history and real-time live map tracking.' }
        ],
        whyChooseUs: [
          { title: 'Structured Categories', description: 'Seamless access to multi-modal transit in one interface.', icon: 'category' },
          { title: 'Order Context Threads', description: 'In-app real-time chat and WebRTC audio calling per booking.', icon: 'chat' },
          { title: 'Transparent Wallet', description: 'Clear history and automated digital receipting.', icon: 'wallet' }
        ],
        features: ['On-Demand Rides', 'Courier Parcel Dispatch', 'Heavy Freight Shipping', 'Verified Vendor Breakdown Support'],
        howItWorks: ['Select service category', 'Input pickup and destination details', 'Track provider arrival in real-time']
      });
    }
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGeneralInfo = async (req, res) => {
  try {
    let info = await GeneralInfo.findOne();
    if (!info) {
      info = new GeneralInfo(req.body);
    } else {
      Object.assign(info, req.body);
    }
    const updated = await info.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
