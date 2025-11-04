# SlotSwapper - Full Stack Intern Technical Challenge

A peer-to-peer time-slot scheduling application built for ServiceHive. Allows users to manage calendars and swap time slots with each other through an intuitive interface.

## 🎯 Overview

SlotSwapper is a complete full-stack application where users can:
- Create and manage calendar events (time slots)
- Mark busy slots as "swappable" to make them available to others
- Browse a marketplace of available swappable slots from other users
- Request to swap their own swappable slot with someone else's slot
- Accept or reject incoming swap requests
- Experience atomic slot ownership exchanges with MongoDB transactions

## 🏗️ Architecture

### Backend
- **Framework**: Node.js with Express and TypeScript
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration
- **Validation**: Zod for type-safe request validation
- **Password Hashing**: bcrypt with salt rounds
- **Transactions**: MongoDB replica set transactions for atomic swaps

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR and optimized builds)
- **Styling**: Tailwind CSS (utility-first, responsive design)
- **Routing**: React Router v6 (protected routes)
- **HTTP Client**: Axios (with interceptors for auth)
- **Date Handling**: date-fns (formatting and parsing)
- **State Management**: React Context API + Hooks

### Database Schema (MongoDB)
- **users**: User authentication and profile (email unique index)
- **events**: Calendar events/slots with status (BUSY, SWAPPABLE, SWAP_PENDING)
- **swap_requests**: Swap requests between users (PENDING, ACCEPTED, REJECTED)

## 🚀 Features

### ✅ All Core Requirements Implemented

1. **User Authentication**
   - ✅ Sign up with name, email, and password
   - ✅ Login with JWT token generation
   - ✅ Protected routes with Bearer token authentication
   - ✅ Automatic token injection via Axios interceptors
   - ✅ Secure password hashing with bcrypt

2. **Event Management (Full CRUD)**
   - ✅ Create events with title, start time, and end time
   - ✅ View all user events in dashboard
   - ✅ Update event status (BUSY ↔ SWAPPABLE)
   - ✅ Delete events (protected if SWAP_PENDING)
   - ✅ Validation for end time > start time

3. **Swap Logic (The Core Challenge)**
   - ✅ `GET /api/swappable-slots` - Browse available slots (excludes your own)
   - ✅ `POST /api/swap-request` - Create swap request with full validation
   - ✅ `POST /api/swap-response/:requestId` - Accept/reject with atomic transactions
   - ✅ Automatic ownership exchange on acceptance
   - ✅ Status management (sets both slots to SWAP_PENDING)
   - ✅ Transaction rollback on errors (MongoDB replica set)

4. **Frontend UI/UX**
   - Authentication pages (Login/Sign Up)
   - Dashboard for managing personal events
   - Marketplace for browsing and requesting swaps
   - Requests page for incoming/outgoing swap requests
   - Real-time state updates after actions

## 📋 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user account | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |

### Event Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/events` | Create a new event | Yes |
| GET | `/api/events` | Get all user's events | Yes |
| GET | `/api/events/:id` | Get specific event | Yes |
| PUT | `/api/events/:id` | Update event details | Yes |
| DELETE | `/api/events/:id` | Delete event | Yes |
| PATCH | `/api/events/:id/status` | Update event status | Yes |

### Swap Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/swappable-slots` | Get all swappable slots from other users | Yes |
| POST | `/api/swap-request` | Create a new swap request | Yes |
| POST | `/api/swap-response/:requestId` | Accept or reject a swap request | Yes |
| GET | `/api/swap-requests/incoming` | Get incoming swap requests | Yes |
| GET | `/api/swap-requests/outgoing` | Get outgoing swap requests | Yes |

### Request/Response Examples

#### Sign Up
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

#### Create Event
```json
POST /api/events
Headers: { "Authorization": "Bearer <token>" }
{
  "title": "Team Meeting",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T11:00:00.000Z",
  "status": "BUSY"
}

Response: 201 Created
{
  "message": "Event created successfully",
  "event": { ...eventDetails }
}
```

#### Request Swap
```json
POST /api/swap-request
Headers: { "Authorization": "Bearer <token>" }
{
  "mySlotId": "my-event-uuid",
  "theirSlotId": "their-event-uuid"
}

Response: 201 Created
{
  "message": "Swap request created successfully",
  "swapRequest": { ...requestDetails }
}
```

#### Respond to Swap
```json
POST /api/swap-response/request-uuid
Headers: { "Authorization": "Bearer <token>" }
{
  "accept": true
}

Response: 200 OK
{
  "message": "Swap request accepted",
  "swapRequest": { ...updatedRequestDetails }
}
```

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ServiceHive
```

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/slotswapper?schema=public"
JWT_SECRET="your-super-secret-key-change-this"
PORT=5000
NODE_ENV=development
```

5. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Start the backend server:
```bash
npm run dev
```

The backend should now be running on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. The default configuration should work:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000`

### Step 4: Test the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Create a new account via Sign Up
3. Create some events in your dashboard
4. Mark some events as "Swappable"
5. Open another browser (or incognito window) and create a second user
6. Create and mark events as swappable for the second user
7. Use the Marketplace to browse and request swaps
8. Switch between accounts to accept/reject swap requests

## 🐳 Docker Setup (Bonus)

For easy deployment and testing, you can use Docker Compose:

```bash
# From the root directory
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend application on port 3000

## 🧪 Design Decisions & Assumptions

### Design Decisions

1. **Database Transactions**: Used Prisma transactions for swap operations to ensure data consistency
2. **Status Management**: Implemented three event statuses (BUSY, SWAPPABLE, SWAP_PENDING) to prevent race conditions
3. **JWT Authentication**: Used JWT with 7-day expiration for stateless authentication
4. **Validation**: Implemented server-side validation with Zod to ensure data integrity
5. **Error Handling**: Consistent error response format across all endpoints

### Assumptions

1. **Time Slots**: No validation for overlapping events (assumed users manage their own schedules)
2. **Swap Logic**: Users can only swap one slot at a time
3. **Ownership Transfer**: When a swap is accepted, complete ownership of events is transferred
4. **Deletion**: Events in SWAP_PENDING status cannot be deleted to maintain data integrity
5. **One Active Swap**: An event can only be involved in one swap request at a time

### Challenges Faced

1. **Atomic Swap Operations**: Ensuring both events are updated simultaneously required careful transaction handling
2. **State Synchronization**: Managing event status transitions (SWAPPABLE → SWAP_PENDING → BUSY/SWAPPABLE)
3. **Race Conditions**: Preventing multiple swap requests for the same slot using status locks
4. **Frontend State Management**: Keeping UI in sync after swap operations without a state management library

## 📁 Project Structure

```
ServiceHive/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth middleware
│   │   ├── routes/                # API routes
│   │   └── index.ts               # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── context/               # React context (Auth)
│   │   ├── pages/                 # Page components
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Helper functions
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🔐 Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All protected routes require valid JWT authentication
- Input validation on both client and server sides
- SQL injection protection via Prisma ORM

## 🚀 Future Enhancements

- Real-time notifications using WebSockets
- Email notifications for swap requests
- Calendar integration (Google Calendar, Outlook)
- Recurring events support
- Multi-slot swap negotiations
- User profiles with ratings/reviews
- Advanced search and filtering in marketplace

## 📝 License

MIT

## 👤 Author

Developed as part of the ServiceHive Full Stack Intern technical challenge.

---

**Note**: Remember to update the `.env` files with actual credentials and never commit them to version control!
