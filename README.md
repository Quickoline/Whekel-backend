# 🚀 Whekel All-In-One Transport & Mobility - Complete Backend API

An exhaustive, production-ready Node.js, Express, MongoDB, and Socket.io REST & Real-Time backend API implementing all 12 core modules of **Whekel (Ride-Backend)**.

---

## 🛠️ Vendor System Workflow (Location ➔ Service ➔ Vendor Admin Profiles)

```
[SuperAdmin] ──► Creates Master Vendor Services Catalog (Towing, Jumpstart, Mechanic)
                       │
[VendorAdmin] ──► Selects which Master Services to deliver in their Location (City/State)
                       │
[Passenger/User] ──► 1. Selects Location (e.g., "Delhi NCR")
                       │
                 ──► 2. Gets Available Services in that Location (GET /api/vendor/services-by-location)
                       │
                 ──► 3. Selects Service (e.g., "Roadside Towing")
                       │
                 ──► 4. Gets Vendor Admin Profiles List offering that service (GET /api/vendor/providers-by-service)
                       │
                 ──► 5. Books Vendor Service with Selected Vendor Admin (POST /api/vendor/book)
```

---

## 📊 Core Modules & Endpoint Reference Matrix

| Module | Base Route | Auth / Role Required | Key Functionality |
| :--- | :--- | :--- | :--- |
| **1. Auth** | `/api/auth` | Public / JWT Token | Login, Signup, Profile, FCM Tokens, Password Reset, RBAC |
| **2. General Info** | `/api/general` | Public (Read), SuperAdmin (Write) | Platform overview, Categories, 3-step guide, Why Choose Us |
| **3. Ride Transport** | `/api/ride` | User, Driver, RideAdmin, LocalAdmin | Booking across 5 vehicle types (`bike`, `taxi`, `bus`, `local`, `other`), fare negotiation, bus route schedules |
| **4. Parcel Courier** | `/api/parcel` | User, ParcelAdmin | Door-to-door courier dispatch, package weight calculation, recipient details, driver allocation |
| **5. Freight & Logistics**| `/api/freight` | User, FreightAdmin | Heavy cargo transport, truck load assignment, commercial shipping |
| **6. Vendor Services** | `/api/vendor` | User, VendorAdmin, SuperAdmin | Location-based vendor service discovery, Master catalog, Vendor Admin profile listing & booking |
| **7. Fleet & Vehicles** | `/api/fleet` | Public, Driver, Admin | Vehicle fleet listings, capacity specs (`EV`/`CNG`, `AC`/`Non AC`, `Sleeper`), bus routes |
| **8. Partner Onboarding**| `/api/partner` | Public (Apply), SuperAdmin | Driver/partner applications, provider onboarding desk & approval lifecycle |
| **9. Audio Calls** | `/api/call` | User, Admin, Driver | Peer-to-peer WebRTC audio call session logging and room management |
| **10. Contact & Support** | `/api/contact` | Public / User / Admin | Direct inquiry submission, ticketing, admin notes & resolution |
| **11. Chat & Messaging** | `/api/chat` | User, Admin, Driver | Order-scoped real-time chat, message history, read receipt tracking |
| **12. Reviews & Ratings**| `/api/review` | User, SuperAdmin | 1 to 5 star ratings, feedback, order reference linkage |

---

## 🛠️ Vendor System API Endpoints

- `GET /api/vendor/locations` - Step 1: List active vendor cities
- `GET /api/vendor/services-by-location?city=Delhi NCR` - Step 2: List available services offered in location
- `GET /api/vendor/providers-by-service?city=Delhi NCR&serviceName=Roadside Towing` - Step 3: Fetch Vendor Admin profiles list for selected location & service
- `POST /api/vendor/book` - Step 4: Book service with selected Vendor Admin
- `PUT /api/vendor/admin/offered-services` - Vendor Admin chooses offered services & location
- `POST /api/vendor/catalog` - SuperAdmin creates master service
- `GET /api/vendor/catalog` - Get master catalog

---

## ⚡ Quick Start & Installation

```bash
npm install
npm run seed
npm run dev
```

Server runs on: `http://localhost:5000`
