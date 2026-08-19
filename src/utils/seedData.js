import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserAuth from '../models/UserAuth.js';
import Admin from '../models/Admin.js';
import VendorService from '../models/VendorService.js';
import GeneralInfo from '../models/GeneralInfo.js';
import Ride from '../models/Ride.js';
import Parcel from '../models/Parcel.js';
import Freight from '../models/Freight.js';
import Vendor from '../models/Vendor.js';
import Fleet from '../models/Fleet.js';
import Partner from '../models/Partner.js';
import Contact from '../models/Contact.js';
import Review from '../models/Review.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whekel_db');
    console.log('[Seed] Connected to MongoDB database...');

    // Clear existing collections
    await UserAuth.deleteMany({});
    await Admin.deleteMany({});
    await VendorService.deleteMany({});
    await GeneralInfo.deleteMany({});
    await Ride.deleteMany({});
    await Parcel.deleteMany({});
    await Freight.deleteMany({});
    await Vendor.deleteMany({});
    await Fleet.deleteMany({});
    await Partner.deleteMany({});
    await Contact.deleteMany({});
    await Review.deleteMany({});

    console.log('[Seed] Cleared old collections...');

    // 1. SuperAdmin ONLY creates Master Vendor Services Catalog (5 Breakdown Services)
    const masterServices = await VendorService.create([
      {
        name: 'Roadside Towing',
        category: 'Emergency Breakdown',
        icon: 'tow_truck',
        description: 'Flatbed and wheel-lift towing for cars, SUVs, and commercial vehicles.'
      },
      {
        name: 'Battery Jumpstart',
        category: 'Quick Support',
        icon: 'battery_charging_full',
        description: 'On-demand 12V battery jumpstart and voltage diagnostics.'
      },
      {
        name: 'Vehicle Mechanic Repair',
        category: 'On-site Repair',
        icon: 'build',
        description: 'Mobile auto mechanics for engine, brake, and transmission troubleshooting.'
      },
      {
        name: 'Flat Tire Replacement',
        category: 'Wheel Support',
        icon: 'tire_repair',
        description: 'Stepney tire replacement and tubeless puncture repairing at your location.'
      },
      {
        name: 'Emergency Fuel Delivery',
        category: 'Fuel Support',
        icon: 'local_gas_station',
        description: 'Emergency petrol or diesel delivery directly to your stranded vehicle.'
      }
    ]);

    console.log('[Seed] SuperAdmin Master Vendor Services Catalog created (5 services).');

    const allServiceNames = masterServices.map((s) => s.name);

    // 2. Create SuperAdmin (ONLY creates services, does NOT offer vendor delivery)
    const superAdmin = await Admin.create({
      name: 'Whekel Global SuperAdmin',
      email: 'superadmin@whekel.com',
      phone: '9999999999',
      password: 'password123',
      role: 'SuperAdmin',
      serviceLocation: { city: 'All', state: 'All', district: 'All', serviceRadiusKm: 10000 },
      assignedServices: ['Ride', 'Parcel', 'Freight', 'Vendor', 'All'],
      vendorProfile: {
        isVendorActive: false,
        offeredServices: [],
        pricingEstimate: 'N/A',
        rating: 5.0,
        completedJobs: 0,
        bio: 'SuperAdmin System Creator'
      },
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
    });

    // 3. Create VendorAdmins (They CHOOSE which master services to deliver in their city)
    const vendorAdminDelhi = await Admin.create({
      name: 'Karan Towing & Breakdown Support Admin',
      email: 'vendoradmin@whekel.com',
      phone: '9876543244',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Delhi NCR', state: 'Delhi', district: 'New Delhi', serviceRadiusKm: 60 },
      assignedServices: allServiceNames,
      vendorProfile: {
        isVendorActive: true,
        offeredServices: ['Roadside Towing', 'Battery Jumpstart', 'Flat Tire Replacement', 'Emergency Fuel Delivery'],
        pricingEstimate: '₹400 Base Rate + ₹20/km',
        rating: 4.8,
        completedJobs: 89,
        bio: '24/7 Rapid Response Towing & Battery Specialist in Delhi NCR'
      },
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'
    });

    const vendorAdminBlr = await Admin.create({
      name: 'Bengaluru Auto Care & Towing Support',
      email: 'vendorblr@whekel.com',
      phone: '9876543266',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', serviceRadiusKm: 50 },
      assignedServices: allServiceNames,
      vendorProfile: {
        isVendorActive: true,
        offeredServices: ['Vehicle Mechanic Repair', 'Battery Jumpstart', 'Flat Tire Replacement', 'Roadside Towing', 'Emergency Fuel Delivery'],
        pricingEstimate: '₹350 Inspection + Parts extra',
        rating: 5.0,
        completedJobs: 114,
        bio: 'Expert Mobile Auto Mechanics for Tech Parks & Highways in Bengaluru'
      },
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    });

    const vendorAdminMumbai = await Admin.create({
      name: 'Mumbai Marine Drive Breakdown Services',
      email: 'vendormumbai@whekel.com',
      phone: '9876543277',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', serviceRadiusKm: 65 },
      assignedServices: allServiceNames,
      vendorProfile: {
        isVendorActive: true,
        offeredServices: allServiceNames,
        pricingEstimate: '₹450 Base Charge',
        rating: 4.7,
        completedJobs: 76,
        bio: 'Citywide Emergency Breakdown & Towing Team in Mumbai'
      },
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'
    });

    const rideAdmin = await Admin.create({
      name: 'Ramesh Driver / Ride Admin (South Zone)',
      email: 'rideadmin@whekel.com',
      phone: '9876543211',
      password: 'password123',
      role: 'RideAdmin',
      serviceLocation: { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', serviceRadiusKm: 100 },
      assignedServices: ['Bike', 'Taxi', 'Bus', 'Local Transport', 'Multi-Stop Schedule'],
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    });

    const parcelAdmin = await Admin.create({
      name: 'Anita Courier Dispatch Admin (West Zone)',
      email: 'parceladmin@whekel.com',
      phone: '9876543222',
      password: 'password123',
      role: 'ParcelAdmin',
      serviceLocation: { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', serviceRadiusKm: 75 },
      assignedServices: ['Door-to-Door Courier', 'Express Parcel', 'Weight-based Delivery'],
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'
    });

    const freightAdmin = await Admin.create({
      name: 'Vikram Heavy Freight Logistics Admin',
      email: 'freightadmin@whekel.com',
      phone: '9876543233',
      password: 'password123',
      role: 'FreightAdmin',
      serviceLocation: { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', serviceRadiusKm: 250 },
      assignedServices: ['Heavy Machinery Transport', 'Inter-City Bulk Shipping', 'Truck Load Logistics'],
      profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a'
    });

    const localAdmin = await Admin.create({
      name: 'Suresh City Metro Local Transport Admin',
      email: 'localadmin@whekel.com',
      phone: '9876543255',
      password: 'password123',
      role: 'LocalAdmin',
      serviceLocation: { city: 'Pune', state: 'Maharashtra', district: 'Pune', serviceRadiusKm: 40 },
      assignedServices: ['Auto Rickshaw', 'Local Shuttle Bus', 'City Commute'],
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
    });

    // Create Sample Passenger User
    const user = await UserAuth.create({
      name: 'Virat Singh',
      email: 'virat@example.com',
      phone: '9876543210',
      password: 'password123',
      fcmToken: 'fcm_token_demo_12345',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      role: 'user'
    });

    console.log('[Seed] SuperAdmin created master catalog. VendorAdmins created with their chosen offeredServices!');

    // 4. Create General Info
    await GeneralInfo.create({
      title: 'Whekel Mobility',
      tagline: 'All In One Transport App',
      categories: ['Ride', 'Parcel', 'Freight', 'Vendor'],
      steps: [
        { stepNumber: 1, title: 'Discover', description: 'Select your city/location, browse available breakdown services, and choose a verified vendor provider.' },
        { stepNumber: 2, title: 'Book & Negotiate', description: 'Direct service booking with instant vendor dispatch.' },
        { stepNumber: 3, title: 'Pay & Track', description: 'Real-time vendor tracking and transparent billing.' }
      ],
      whyChooseUs: [
        { title: 'Location-Based Vendor Search', description: 'Find roadside assistance tailored specifically to your current city.', icon: 'my_location' },
        { title: 'Verified Vendor Profiles', description: 'Choose from rated vendor admins with transparent pricing and review stats.', icon: 'verified' }
      ],
      features: ['Roadside Towing', 'Battery Jumpstart', 'Mobile Car Mechanic', 'Flat Tire Repair', 'Fuel Delivery'],
      howItWorks: ['Select Location (e.g. Delhi NCR)', 'Pick Service (e.g. Towing)', 'Choose Vendor Admin Profile', 'Track Arrival'],
      onboardingInfo: 'Join over 10,000+ verified vendor admins on the network.'
    });

    // 5. Create Vendor Request (Linking Location -> Selected Service -> VendorAdmin Profile)
    const demoVendorReq = await Vendor.create({
      userId: user._id,
      phone: '9876543210',
      serviceName: 'Roadside Towing',
      profession: 'Roadside Towing',
      location: 'Connaught Place Metro Station Gate 2',
      locationDetails: { city: 'Delhi NCR', state: 'Delhi' },
      description: 'Car engine stalled, need flatbed towing to authorized service center in Okhla.',
      status: 'accepted',
      assignedVendorId: vendorAdminDelhi._id,
      isActive: 'active'
    });

    console.log('\n[Seed Success] Vendor system role separation updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
