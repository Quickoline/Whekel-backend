# 🚀 Whekel All-In-One Transport & Mobility - Complete Backend API

An exhaustive, production-ready Node.js, Express, MongoDB, and Socket.io REST & Real-Time backend API implementing all 12 core modules of **Whekel (Ride-Backend)**.

---

## 📊 Core Modules & Endpoint Reference Matrix

| Module | Base Route | Auth / Role Required | Key Functionality |
| :--- | :--- | :--- | :--- |
| **1. Auth** | `/api/auth` | Public / JWT Token | Login, Signup, Profile, FCM Tokens, Password Reset, RBAC |
| **2. General Info** | `/api/general` | Public (Read), SuperAdmin (Write) | Platform overview, Categories, 3-step guide, Why Choose Us |
| **3. Ride Transport** | `/api/ride` | User, Driver, RideAdmin, LocalAdmin | Booking across 5 vehicle types (`bike`, `taxi`, `bus`, `local`, `other`), fare negotiation, bus route schedules |
| **4. Parcel Courier** | `/api/parcel` | User, ParcelAdmin | Door-to-door courier dispatch, package weight calculation, recipient details, driver allocation |
| **5. Freight & Logistics**| `/api/freight` | User, FreightAdmin | Heavy cargo transport, truck load assignment, commercial shipping |
| **6. Vendor Services** | `/api/vendor` | User, VendorAdmin, Provider | Vehicle mechanics, breakdown support, battery jumpstart, roadside assistance |
| **7. Fleet & Vehicles** | `/api/fleet` | Public, Driver, Admin | Vehicle fleet listings, capacity specs (`EV`/`CNG`, `AC`/`Non AC`, `Sleeper`), bus routes |
| **8. Partner Onboarding**| `/api/partner` | Public (Apply), SuperAdmin | Driver/partner applications, provider onboarding desk & approval lifecycle |
| **9. Audio Calls** | `/api/call` | User, Admin, Driver | Peer-to-peer WebRTC audio call session logging and room management |
| **10. Contact & Support** | `/api/contact` | Public / User / Admin | Direct inquiry submission, ticketing, admin notes & resolution |
| **11. Chat & Messaging** | `/api/chat` | User, Admin, Driver | Order-scoped real-time chat, message history, read receipt tracking |
| **12. Reviews & Ratings**| `/api/review` | User, SuperAdmin | 1 to 5 star ratings, feedback, order reference linkage |

---

## ⚡ Socket.io Real-Time & WebRTC Events

- **Instant Messaging**:
  - `join_chat`: Join room `conversationId`
  - `send_message`: Emit message to room
  - `receive_message`: Incoming message broadcast
  - `typing`: Typing indicator state
- **WebRTC Audio Calls**:
  - `join_call_room`: Join WebRTC call room
  - `call_offer`: WebRTC SDP Offer exchange
  - `call_answer`: WebRTC SDP Answer exchange
  - `ice_candidate`: ICE Candidate exchange
  - `end_call`: Terminate active call session

---

## 🛠️ Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/whekel_db
JWT_SECRET=whekel_super_secret_jwt_key_2026_secure
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Seed Initial Database Data
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server runs on: `http://localhost:5000`
