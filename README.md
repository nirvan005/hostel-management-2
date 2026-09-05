# HostelOS — Modern University Hostel Management System

HostelOS is a full-stack, multi-tenant web application designed to digitize and streamline university hostel administration. It serves as a unified command center for Chief Wardens, Resident Wardens, and Students, bridging the gap between manual record-keeping and modern campus life.

## Problem Being Solved
Managing university hostels typically involves chaotic paper ledgers, fragmented Excel sheets, and disconnected communication channels. Tasks like issuing out-passes, tracking student room allotments, managing maintenance, and collecting semester fees are often slow and error-prone. HostelOS solves this by providing a centralized digital system that automates these workflows, enforces permissions, and provides real-time visibility into campus occupancy and operations.

## Target Users
- **Chief Warden (Super Admin):** Oversees all hostel blocks, generates invites for new staff, and has global access to all data and financial metrics.
- **Resident Warden (Admin):** Manages specific assigned hostel blocks, approves student out-passes, logs gate exits/entries, tracks local room occupancy, and generates invoices.
- **Students:** Can view their room allotment and roommates, apply for leave out-passes, track their approval status, and monitor their outstanding fee invoices.

## Key Capabilities & Workflows
- **Dynamic Dashboard:** Real-time metrics on occupancy, pending requests, active leaves, and unpaid invoices with interactive charts.
- **Smart Room Allocation:** Visual, floor-by-floor grids showing room status (vacant, occupied, maintenance) and assigned students.
- **Out-Pass (Leave) Management:** Students apply for leave online; Wardens approve/reject them and log the actual exit/return times at the gate.
- **Financial Ledger & Bulk Invoicing:** Wardens can generate single or bulk semester invoices. Students can track their payment status, download PDF receipts, and make simulated payments via a mocked Razorpay checkout flow.
- **Global Search:** Instantly search through students, rooms, and invoices directly from the admin navigation bar.
- **Notifications & Reminders:** Built-in real-time alerts for students to receive fee reminders and updates directly within the student portal.
- **Maintenance & Complaints:** Wardens can flag rooms for maintenance to temporarily take them out of the allotment pool, ensuring a smooth operations flow.
- **Role-Based Access Control (RBAC):** Strict isolation between students, admins, and the super admin.

## Architecture & Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Routing:** TanStack Router (File-based, type-safe routing)
- **State Management:** TanStack React Query v5 for API caching and synchronization
- **Styling:** Tailwind CSS v4, shadcn/ui components, Radix UI primitives, Framer Motion
- **Tooling:** Prettier, ESLint

### Backend
- **Framework:** Node.js + Express.js
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) via HTTP-only Cookies & Bearer Tokens
- **Security:** Helmet, CORS, Express Rate Limit, Mongo Sanitize, XSS Clean, HPP

## Authentication and Security
- **JWT Authentication:** Tokens are signed using a secure secret and expire after 1 hour. Tokens are sent to the client upon login.
- **Role-Based Middleware:** Routes are guarded using custom middleware (`protect` and `authorizeRoles`) ensuring users can only access endpoints authorized for their scope.
- **Tenant Isolation:** Admin users can only query data (students, leaves, rooms, invoices) related to the specific hostel blocks they are assigned to manage.
- **Security Headers:** The backend utilizes helmet for security headers, rate limiting to prevent brute force, and payload sanitization against NoSQL injection and XSS.

## Project Structure
```text
hostel-management-2/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Business logic and request handlers
│   ├── middlewares/          # Auth, error handling, validation, security
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # Express route definitions
│   └── index.js              # API Entry point
│
└── frontend/                 # React + Vite Application
    ├── src/
    │   ├── api/              # Axios client configuration
    │   ├── components/       # Reusable UI components (shadcn/ui, layout)
    │   ├── context/          # React context (Auth Context)
    │   ├── routes/           # TanStack router page components
    │   └── lib/              # Utility functions
    └── package.json          # Frontend dependencies
```

## Setup & Usage Instructions

A new developer can clone this repository and follow these steps to run the application locally from a clean environment.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas cluster)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_super_secret_jwt_key
   ACCESS_TOKEN_EXPIRES_IN=1h
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be available at `http://localhost:4000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will typically launch at `http://localhost:5173` or `http://localhost:8080` depending on port availability.*

### 3. Testing the Application
The application includes a script to seed initial dummy data (hostels, rooms, and a Chief Warden account). Ensure your `MONGO_URI` is correctly set and the backend is running.

1. **Seed Data:** Run the seeding script (if available) or create a Super Admin user directly in your database.
2. **Login:** Navigate to the frontend URL.
3. **Chief Warden Access:**
   - **Email:** `chief@university.edu`
   - **Password:** `securepassword123`
4. Use the Chief Warden account to navigate to the **Staff** tab and generate secure invite links to create additional Admin (Warden) accounts.
5. Use Wardens to onboard students and allocate rooms!

## Deployment Information
- **Database:** Deploy your MongoDB cluster using MongoDB Atlas.
- **Backend:** Deploy the Express API to a platform like Render, Heroku, or AWS EC2. Ensure environment variables are properly configured in the production environment.
- **Frontend:** Build the static assets using `npm run build` and deploy the `dist/` directory to Vercel, Netlify, or AWS S3/CloudFront. Ensure that the API base URL in `frontend/src/api/client.ts` points to your production backend URL.
