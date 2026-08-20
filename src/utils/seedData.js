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
import TourOption from '../models/TourOption.js';
import Tour from '../models/Tour.js';
import MiniTransport from '../models/MiniTransport.js';
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
    await TourOption.deleteMany({});
    await Tour.deleteMany({});
    await MiniTransport.deleteMany({});

    console.log('[Seed] Cleared old collections...');

    // 1. Upload phoadi.jpg and profile3.jpg to AWS S3
    const localPhoadiPath = path.join(process.cwd(), 'phoadi.jpg');
    const localProfile3Path = path.join(process.cwd(), 'profile3.jpg');

    const s3PhoadiUrl = await uploadFileToS3(localPhoadiPath, 'profiles/phoadi.jpg');
    const s3Profile3Url = await uploadFileToS3(localProfile3Path, 'profiles/profile3.jpg');

    const viratPhotoUrl = s3PhoadiUrl || 'https://whekel.s3.us-east-1.amazonaws.com/profiles/phoadi.jpg';
    const virajPhotoUrl = s3Profile3Url || 'https://whekel.s3.us-east-1.amazonaws.com/profiles/profile3.jpg';

    console.log(`[Seed] S3 Photos ready:\n - Virat Photo: ${viratPhotoUrl}\n - Viraj Photo: ${virajPhotoUrl}`);

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
    const roadsideTowingService = masterServices.find((s) => s.name === 'Roadside Towing');

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
        homeServiceAvailable: false,
        offeredServices: [],
        pricingEstimate: 'N/A',
        rating: 5.0,
        completedJobs: 0,
        bio: 'SuperAdmin System Creator'
      },
      profilePhoto: viratPhotoUrl
    });

    // 4. Seed VendorAdmin 1: Virat Singh (Virat Repair Shop, 9889765643)
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
      profilePhoto: viratPhotoUrl
    });

    // 5. Seed VendorAdmin 2: Viraj Gupta (Viraj Sweet Shop, 9078564534)
    const virajVendorAdmin = await Admin.create({
      name: 'Viraj Gupta',
      email: 'virajgupta@whekel.com',
      phone: '9078564534',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Bengaluru', district: 'Bengaluru Urban', pinCode: '560001', state: 'Karnataka', serviceRadiusKm: 100 },
      assignedServices: allServiceNames,
      vendorProfile: {
        shopName: 'Viraj Sweet Shop',
        isVendorActive: true,
        homeServiceAvailable: false,
        offeredServices: allServiceNames,
        pricingEstimate: '₹250 Fixed Rate',
        rating: 4.9,
        completedJobs: 180,
        bio: 'Viraj Sweet Shop - Professional Automobile & On-Spot Repair Hub'
      },
      profilePhoto: virajPhotoUrl
    });

    // 6. Seed LocalAdmin
    const localAdmin = await Admin.create({
      name: 'Suresh City Metro Local Transport Admin',
      email: 'localadmin@whekel.com',
      phone: '9876543255',
      password: 'password123',
      role: 'LocalAdmin',
      serviceLocation: { city: 'Bengaluru', district: 'Bengaluru Urban', pinCode: '560001', state: 'Karnataka', serviceRadiusKm: 50 },
      assignedServices: ['Tour', 'Mini Transport', 'Auto Rickshaw', 'Shuttle Bus'],
      profilePhoto: virajPhotoUrl
    });

    // 7. Seed LocalAdmin Tour Dropdown Vehicle Options
    await TourOption.create([
      {
        createdBy: localAdmin._id,
        vehicleName: 'Innova Crysta',
        vehicleModel: 'Luxury Executive 2024',
        fuelType: 'Diesel',
        acType: 'AC',
        seatCapacity: '7 Seater',
        basePrice: 3500
      },
      {
        createdBy: localAdmin._id,
        vehicleName: 'Tempo Traveller',
        vehicleModel: 'Deluxe Pushback 2024',
        fuelType: 'Diesel',
        acType: 'AC',
        seatCapacity: '12 Seater',
        basePrice: 6500
      },
      {
        createdBy: localAdmin._id,
        vehicleName: 'Force Urbania',
        vehicleModel: 'VIP Luxury 2025',
        fuelType: 'Diesel',
        acType: 'AC',
        seatCapacity: '17 Seater',
        basePrice: 9000
      },
      {
        createdBy: localAdmin._id,
        vehicleName: 'Swift Dzire',
        vehicleModel: 'Sedan Comfort 2023',
        fuelType: 'CNG',
        acType: 'AC',
        seatCapacity: '4 Seater',
        basePrice: 2200
      }
    ]);

    console.log('[Seed] LocalAdmin Tour vehicle dropdown options created.');

    // 8. Create Sample User Passenger
    const user = await UserAuth.create({
      name: 'Virat Singh',
      email: 'virat@example.com',
      phone: '9876543210',
      password: 'password123',
      fcmToken: 'fcm_token_demo_12345',
      profilePhoto: viratPhotoUrl,
      role: 'user'
    });

    // 9. Create Contact Query for SuperAdmin Review
    await Contact.create({
      userId: user._id,
      name: 'Virat Singh',
      phone: '9876543210',
      email: 'virat@example.com',
      subject: 'Franchise Partner Inquiry',
      message: 'Inquiring about franchise partner onboarding for South Bengaluru zone.',
      queryMessage: 'Inquiring about franchise partner onboarding for South Bengaluru zone.'
    });

    // 10. Create Partner Onboarding Application for SuperAdmin Review
    await Partner.create({
      userId: user._id,
      name: 'Virat Singh',
      email: 'virat@example.com',
      phone: '9876543210',
      businessName: 'Virat Mobility & Breakdown Services',
      serviceType: 'Vendor',
      location: 'Bengaluru, Karnataka',
      partnerType: 'Vendor',
      documentUrl: viratPhotoUrl,
      status: 'pending'
    });

    // 11. Create Sample Vendor Breakdown Order
    await Vendor.create({
      userId: user._id,
      serviceId: roadsideTowingService ? roadsideTowingService._id : null,
      serviceName: 'Roadside Towing',
      profession: 'Roadside Towing',
      vendorsListIds: [viratVendorAdmin._id],
      assignedVendorId: viratVendorAdmin._id,
      phone: '9889765643',
      location: 'MG Road Metro Station',
      locationDetails: { city: 'Bengaluru', district: 'Bengaluru Urban', pinCode: '560001', state: 'Karnataka' },
      description: 'Breakdown & Repair Service Request',
      status: 'accepted',
      isActive: 'active'
    });

    // 12. Create Sample Tour Booking Order for LocalAdmin (Calls User directly)
    await Tour.create({
      userId: user._id,
      currentLocation: 'Indiranagar 100ft Road',
      destination: 'Nandi Hills Sunrise Point',
      pinCode: '560038',
      phone: '9876543210',
      vehicleName: 'Innova Crysta',
      vehicleModel: 'Luxury Executive 2024',
      fuelType: 'Diesel',
      acType: 'AC',
      seatCapacity: '7 Seater',
      status: 'pending'
    });

    // 13. Create Sample Mini Transport Booking Order for LocalAdmin (Calls User directly)
    await MiniTransport.create({
      userId: user._id,
      currentLocation: 'Electronic City Phase 1',
      destination: 'Koramangala 5th Block',
      pinCode: '560100',
      phone: '9876543210',
      goodsType: 'Office Furniture & Electronic Equipment',
      status: 'pending'
    });

    console.log('\n[Seed Success] SuperAdmin, VendorAdmin & LocalAdmin (Tour & Mini Transport) seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
