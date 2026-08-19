import mongoose from 'mongoose';

const generalInfoSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Whekel Mobility' },
    tagline: { type: String, default: 'All In One Transport App' },
    categories: { type: [String], default: ['Ride', 'Parcel', 'Freight', 'Vendor'] },
    steps: [
      {
        stepNumber: { type: Number },
        title: { type: String },
        description: { type: String }
      }
    ],
    whyChooseUs: [
      {
        title: { type: String },
        description: { type: String },
        icon: { type: String }
      }
    ],
    features: { type: [String], default: [] },
    howItWorks: { type: [String], default: [] },
    onboardingInfo: { type: String, default: '' }
  },
  { timestamps: true }
);

const GeneralInfo = mongoose.model('GeneralInfo', generalInfoSchema);
export default GeneralInfo;
