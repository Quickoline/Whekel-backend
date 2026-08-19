import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
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
import { uploadFileToS3 } from './s3Uploader.js';

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

    // 1. Upload phoadi.jpg to AWS S3
    const localImagePath = path.join(process.cwd(), 'phoadi.jpg');
    const s3PhotoUrl = await uploadFileToS3(localImagePath, 'profiles/phoadi.jpg');
    const finalPhotoUrl = s3PhotoUrl || 'https://whekel.s3.us-east-1.amazonaws.com/profiles/phoadi.jpg';

    console.log(`[Seed] Profile photo ready: ${finalPhotoUrl}`);

    // 2. SuperAdmin Master Vendor Services Catalog (5 Breakdown Services)
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

    // 3. Create SuperAdmin
    const superAdmin = await Admin.create({
      name: 'Whekel Global SuperAdmin',
      email: 'superadmin@whekel.com',
      phone: '9999999999',
      password: 'password123',
      role: 'SuperAdmin',
      serviceLocation: { city: 'All', district: 'All', pinCode: 'All', state: 'All', serviceRadiusKm: 10000 },
      assignedServices: ['Ride', 'Parcel', 'Freight', 'Vendor', 'All'],
      vendorProfile: {
        shopName: 'Whekel Master Admin Hub',
        isVendorActive: false,
        homeServiceAvailable: true,
        offeredServices: [],
        pricingEstimate: 'N/A',
        rating: 5.0,
        completedJobs: 0,
        bio: 'SuperAdmin System Creator'
      },
      profilePhoto: finalPhotoUrl
    });

    // 4. Seed Virat Singh as VendorAdmin for EVERY Vendor Service with homeServiceAvailable: true
    const viratVendorAdmin = await Admin.create({
      name: 'Virat Singh',
      email: 'viratsingh@whekel.com',
      phone: '9889765643',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Bengaluru', district: 'Bengaluru Urban', pinCode: '560001', state: 'Karnataka', serviceRadiusKm: 100 },
      assignedServices: allServiceNames,
      vendorProfile: {
        shopName: 'Virat Repair Shop',
        isVendorActive: true,
        homeServiceAvailable: true,
        offeredServices: allServiceNames,
        pricingEstimate: '₹300 Base Charge + Parts at MRP',
        rating: 5.0,
        completedJobs: 215,
        bio: 'Virat Repair Shop - 24/7 Complete Automobile & Breakdown Solutions'
      },
      profilePhoto: finalPhotoUrl
    });

    const vendorAdminDelhi = await Admin.create({
      name: 'Karan Towing & Breakdown Support Admin',
      email: 'vendoradmin@whekel.com',
      phone: '9876543244',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Delhi NCR', district: 'New Delhi', pinCode: '110001', state: 'Delhi', serviceRadiusKm: 60 },
      assignedServices: allServiceNames,
      vendorProfile: {
        shopName: 'Delhi Towing Hub',
        isVendorActive: true,
        homeServiceAvailable: true,
        offeredServices: ['Roadside Towing', 'Battery Jumpstart', 'Flat Tire Replacement', 'Emergency Fuel Delivery'],
        pricingEstimate: '₹400 Base Rate + ₹20/km',
        rating: 4.8,
        completedJobs: 89,
        bio: '24/7 Rapid Response Towing & Battery Specialist in Delhi NCR'
      },
      profilePhoto: finalPhotoUrl
    });

    const vendorAdminMumbai = await Admin.create({
      name: 'Mumbai Marine Drive Breakdown Services',
      email: 'vendormumbai@whekel.com',
      phone: '9876543277',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Mumbai', district: 'Mumbai City', pinCode: '400001', state: 'Maharashtra', serviceRadiusKm: 65 },
      assignedServices: allServiceNames,
      vendorProfile: {
        shopName: 'Mumbai Marine Garage',
        isVendorActive: true,
        homeServiceAvailable: true,
        offeredServices: allServiceNames,
        pricingEstimate: '₹450 Base Charge',
        rating: 4.7,
        completedJobs: 76,
        bio: 'Citywide Emergency Breakdown & Towing Team in Mumbai'
      },
      profilePhoto: finalPhotoUrl
    });

    const rideAdmin = await Admin.create({
      name: 'Ramesh Driver / Ride Admin (South Zone)',
      email: 'rideadmin@whekel.com',
      phone: '9876543211',
      password: 'password123',
      role: 'RideAdmin',
      serviceLocation: { city: 'Bengaluru', district: 'Bengaluru Urban', pinCode: '560001', state: 'Karnataka', serviceRadiusKm: 100 },
      assignedServices: ['Bike', 'Taxi', 'Bus', 'Local Transport', 'Multi-Stop Schedule'],
      profilePhoto: finalPhotoUrl
    });

    const parcelAdmin = await Admin.create({
      name: 'Anita Courier Dispatch Admin (West Zone)',
      email: 'parceladmin@whekel.com',
      phone: '9876543222',
      password: 'password123',
      role: 'ParcelAdmin',
      serviceLocation: { city: 'Mumbai', district: 'Mumbai City', pinCode: '400001', state: 'Maharashtra', serviceRadiusKm: 75 },
      assignedServices: ['Door-to-Door Courier', 'Express Parcel', 'Weight-based Delivery'],
      profilePhoto: finalPhotoUrl
    });

    const freightAdmin = await Admin.create({
      name: 'Vikram Heavy Freight Logistics Admin',
      email: 'freightadmin@whekel.com',
      phone: '9876543233',
      password: 'password123',
      role: 'FreightAdmin',
      serviceLocation: { city: 'Chennai', district: 'Chennai', pinCode: '600001', state: 'Tamil Nadu', serviceRadiusKm: 250 },
      assignedServices: ['Heavy Machinery Transport', 'Inter-City Bulk Shipping', 'Truck Load Logistics'],
      profilePhoto: finalPhotoUrl
    });

    const localAdmin = await Admin.create({
      name: 'Suresh City Metro Local Transport Admin',
      email: 'localadmin@whekel.com',
      phone: '9876543255',
      password: 'password123',
      role: 'LocalAdmin',
      serviceLocation: { city: 'Pune', district: 'Pune', pinCode: '411001', state: 'Maharashtra', serviceRadiusKm: 40 },
      assignedServices: ['Auto Rickshaw', 'Local Shuttle Bus', 'City Commute'],
      profilePhoto: finalPhotoUrl
    });

    // Create Sample Passenger User
    const user = await UserAuth.create({
      name: 'Virat Singh',
      email: 'virat@example.com',
      phone: '9876543210',
      password: 'password123',
      fcmToken: 'fcm_token_demo_12345',
      profilePhoto: finalPhotoUrl,
      role: 'user'
    });

    console.log('[Seed] Seeded homeServiceAvailable: true for all vendor admins!');

    // 5. Create General Info
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
        { title: 'Location-Based Vendor Search', description: 'Find roadside assistance tailored specifically to your current city, district, or pincode.', icon: 'my_location' },
        { title: 'Verified Vendor Profiles', description: 'Choose from rated vendor admins with transparent pricing and review stats.', icon: 'verified' }
      ],
      features: ['Roadside Towing', 'Battery Jumpstart', 'Mobile Car Mechanic', 'Flat Tire Repair', 'Fuel Delivery'],
      howItWorks: ['Select Location (city, district, pincode)', 'Pick Service', 'Choose Vendor Admin Profile', 'Track Arrival'],
      onboardingInfo: 'Join over 10,000+ verified vendor admins on the network.'
    });

    // 6. Create Active Breakdown Request
    const demoVendorReq = await Vendor.create({
      userId: user._id,
      phone: '9889765643',
      serviceName: 'Roadside Towing',
      profession: 'Roadside Towing',
      location: 'MG Road Metro Station',
      locationDetails: { city: 'Bengaluru', district: 'Bengaluru Urban', pinCode: '560001', state: 'Karnataka' },
      description: 'Vehicle breakdown, flatbed towing required to Virat Repair Shop.',
      status: 'accepted',
      assignedVendorId: viratVendorAdmin._id,
      isActive: 'active'
    });

    console.log('\n[Seed Success] homeServiceAvailable: true seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
