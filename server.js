import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import generalRoutes from './src/routes/generalRoutes.js';
import rideRoutes from './src/routes/rideRoutes.js';
import parcelRoutes from './src/routes/parcelRoutes.js';
import freightRoutes from './src/routes/freightRoutes.js';
import vendorRoutes from './src/routes/vendorRoutes.js';
import fleetRoutes from './src/routes/fleetRoutes.js';
import partnerRoutes from './src/routes/partnerRoutes.js';
import callRoutes from './src/routes/callRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

// Socket Handler
import { initializeSockets } from './src/sockets/socketHandler.js';

// Environment Configuration
dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Whekel All-In-One Transport & Mobility Backend',
    version: '1.0.0',
    modules: [
      '1. Auth (*)',
      '2. General Info (W)',
      '3. Ride / Transport (AW)',
      '4. Parcel Service (AW)',
      '5. Freight & Logistics (AW)',
      '6. Vendor Services (AW)',
      '7. Fleet & Vehicles (W)',
      '8. Partner Onboarding (W)',
      '9. Audio Calls (A)',
      '10. Contact & Support (WA)',
      '11. Chat & Messaging (A)',
      '12. Reviews & Ratings (A)'
    ]
  });
});

// Mount Module API Routes
app.use('/api/auth', authRoutes);
app.use('/api/general', generalRoutes);
app.use('/api/ride', rideRoutes);
app.use('/api/parcel', parcelRoutes);
app.use('/api/freight', freightRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/call', callRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/review', reviewRoutes);

// Socket.io Real-Time Event Handlers
initializeSockets(io);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Whekel Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io WebRTC & Real-time Messaging Ready`);
  console.log(`=======================================================`);
});
