import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserAuth from '../models/UserAuth.js';
import Admin from '../models/Admin.js';
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

    // Clear existing data
    await UserAuth.deleteMany({});
    await Admin.deleteMany({});
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

    // 1. Create All Admin Roles with Location & Service Authority
    const superAdmin = await Admin.create({
      name: 'Whekel Global SuperAdmin',
      email: 'superadmin@whekel.com',
      phone: '9999999999',
      password: 'password123',
      role: 'SuperAdmin',
      serviceLocation: { city: 'All', state: 'All', district: 'All', serviceRadiusKm: 10000 },
      assignedServices: ['Ride', 'Parcel', 'Freight', 'Vendor', 'All'],
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
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

    const vendorAdmin = await Admin.create({
      name: 'Karan Towing & Breakdown Support Admin',
      email: 'vendoradmin@whekel.com',
      phone: '9876543244',
      password: 'password123',
      role: 'VendorAdmin',
      serviceLocation: { city: 'Delhi NCR', state: 'Delhi', district: 'New Delhi', serviceRadiusKm: 60 },
      assignedServices: ['Roadside Mechanic', 'Towing Truck Support', 'Battery Jumpstart', 'Emergency Repairs'],
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'
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

    console.log('[Seed] All 6 Admin Roles (SuperAdmin, RideAdmin, ParcelAdmin, FreightAdmin, VendorAdmin, LocalAdmin) & User created with location authority!');

    // 2. Create General Info
    await GeneralInfo.create({
      title: 'Whekel Mobility',
      tagline: 'All In One Transport App',
      categories: ['Ride', 'Parcel', 'Freight', 'Vendor'],
      steps: [
        { stepNumber: 1, title: 'Discover', description: 'Explore Ride, Parcel, Freight, and Breakdown Vendor services in one unified platform.' },
        { stepNumber: 2, title: 'Book & Negotiate', description: 'Direct fare negotiations with verified transit providers.' },
        { stepNumber: 3, title: 'Pay & Track', description: 'Real-time GPS tracking with transparent wallet settlement.' }
      ],
      whyChooseUs: [
        { title: 'Structured Categories', description: 'Comprehensive mobility modes for passengers, courier dispatches, and bulk freight.', icon: 'category' },
        { title: 'Order Context Threads', description: 'In-app WebRTC audio calls and order-scoped real-time chat messaging.', icon: 'chat' },
        { title: 'Transparent Wallet History', description: 'Zero hidden fees with instant billing statements.', icon: 'wallet' }
      ],
      features: ['Multi-Stop Bus Schedules', 'Door-to-Door Parcel Delivery', 'Industrial Heavy Freight Shipping', '24/7 Breakdown Assistance'],
      howItWorks: ['Choose service module', 'Confirm details and location', 'Track live trip status'],
      onboardingInfo: 'Join over 10,000+ driver partners and verified vendors across the network.'
    });

    console.log('[Seed] General Info populated.');

    // 3. Create Ride (Assigned to RideAdmin)
    const demoRide = await Ride.create({
      userId: user._id,
      adminId: rideAdmin._id,
      vehicleType: 'bus',
      vehicleName: 'Camry Express Coach',
      pickup: '123 Main St, Bengaluru',
      drop: '456 Oak Ave, Chennai',
      stops: [
        { name: 'Hosur Toll Plaza', address: 'NH 44, Hosur', lat: 12.7409, lng: 77.8253 },
        { name: 'Vellore Bypass', address: 'Vellore Highway', lat: 12.9165, lng: 79.1325 }
      ],
      fare: 450,
      status: 'accepted',
      busSchedule: {
        start: 'Bengaluru Inter-City Terminal',
        endpoint: 'Chennai Central Station',
        schedule: [
          { time: '08:00 AM', days: ['Monday', 'Wednesday', 'Friday'] }
        ]
      }
    });

    console.log('[Seed] Ride sample created.');

    // 4. Create Parcel (Assigned to ParcelAdmin)
    const demoParcel = await Parcel.create({
      userId: user._id,
      phone: '9876543210',
      pickup: 'Warehouse A, Whitefield',
      pickupLocation: { city: 'Mumbai', state: 'MH', district: 'Mumbai City', pinCode: '400001' },
      packageName: 'Electronics & Spare Cables',
      packageWeight: 5.5,
      recipientName: 'Rahul Sharma',
      recipientPhone: '9123456789',
      recipientAddress: 'Flat 302, Sea Crest Apartments, Marine Lines',
      acceptedAdmins: [
        {
          adminId: parcelAdmin._id,
          name: parcelAdmin.name,
          phone: parcelAdmin.phone,
          profilePhoto: parcelAdmin.profilePhoto,
          profession: 'Express Courier Dispatch Admin'
        }
      ],
      status: 'in_transit'
    });

    console.log('[Seed] Parcel sample created.');

    // 5. Create Freight (Assigned to FreightAdmin)
    const demoFreight = await Freight.create({
      userId: user._id,
      phone: '9876543210',
      pickup: 'Industrial Hub, Ennore',
      pickupLocation: { city: 'Chennai', state: 'TN', district: 'Chennai', pinCode: '600057' },
      packageName: 'Machinery Heavy Spare Parts',
      packageWeight: 450.0,
      recipientName: 'Suresh Kumar',
      recipientPhone: '9884012345',
      recipientAddress: 'Plot 45, Auto Nagar, Visakhapatnam',
      acceptedAdmins: [
        {
          adminId: freightAdmin._id,
          name: freightAdmin.name,
          phone: freightAdmin.phone,
          profilePhoto: freightAdmin.profilePhoto,
          profession: 'Heavy Freight Logistics Admin'
        }
      ],
      status: 'pending'
    });

    console.log('[Seed] Freight sample created.');

    // 6. Create Vendor Service Request (Assigned to VendorAdmin)
    const demoVendor = await Vendor.create({
      userId: user._id,
      phone: '9876543210',
      profession: 'Vehicle Mechanic / Breakdown Support',
      location: 'Connaught Place',
      locationDetails: { city: 'Delhi NCR', state: 'Delhi' },
      description: 'Roadside car battery jumpstart and towing required immediately',
      status: 'accepted',
      assignedVendorId: vendorAdmin._id,
      isActive: 'active'
    });

    console.log('[Seed] Vendor service sample created.');

    // 7. Create Fleet (Assigned to RideAdmin)
    await Fleet.create({
      adminId: rideAdmin._id,
      name: 'Express Traveler Coach',
      model: 'Force Traveller 2024 Luxury',
      number: 'KA-01-MJ-9999',
      type: 'bus',
      fuelType: 'EV',
      acType: 'AC',
      sleeperType: 'Sleeper',
      seatCapacity: 24,
      routes: [
        {
          start: 'Bengaluru',
          endpoint: 'Chennai',
          schedule: [
            { time: '08:00 AM', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
          ]
        }
      ]
    });

    console.log('[Seed] Fleet vehicle sample created.');

    // 8. Create Partner Onboarding Application
    await Partner.create({
      name: 'Jitesh Mishra',
      email: 'jitesh@example.com',
      phone: '9876543210',
      businessName: 'Mishra Commercial Cabs',
      serviceType: 'All',
      location: 'Bengaluru',
      additionalInfo: 'Operating fleet of 10 commercial cabs and heavy cargo loaders.',
      status: 'pending'
    });

    console.log('[Seed] Partner onboarding application sample created.');

    // 9. Create Support Contact Ticket
    await Contact.create({
      name: 'Virat Singh',
      email: 'virat@example.com',
      subject: 'Delivery Query #6b283d',
      message: 'Parcel delivery status is showing in_transit, please confirm expected arrival time.',
      role: 'user',
      status: 'open'
    });

    console.log('[Seed] Contact ticket sample created.');

    // 10. Create Review
    await Review.create({
      userId: user._id,
      relatedOrderId: demoRide._id,
      orderType: 'ride',
      rating: 5,
      title: 'Great Bus Trip',
      ratingMessage: 'Excellent driving, punctual arrival, and very clean vehicle seats!'
    });

    console.log('[Seed] Review sample created.');

    console.log('\n[Seed Success] All 6 Admins with Location Data and 12 Whekel modules populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
