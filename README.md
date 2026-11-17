# JobConnect - Full-Stack MERN Job Portal

JobConnect is a full-stack job platform engineered with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS. It connects software engineers, product designers, and tech talent with forward-thinking companies through verified listings, transparent compensation, and streamlined discovery.

---

## Technology Stack

### Frontend (`client/`)
- **Core Library**: React 18 (Functional Components & Hooks)
- **Bundler & Dev Server**: Vite 6
- **Language**: JavaScript (ES Modules)
- **Routing**: React Router DOM v6
- **State & Context**: React Context API (`AuthContext`)
- **Styling**: Tailwind CSS v3 & PostCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios with interceptors for automatic JWT authorization and 401 recovery

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules: `"type": "module"`)
- **Framework**: Express.js
- **Database ODM**: Mongoose
- **Authentication**: JSON Web Token (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Environment Management**: Dotenv
- **Security & Headers**: Helmet, CORS
- **Development Tooling**: Nodemon, Morgan

---

## Project Structure

```text
JobConnect/
├── client/                               # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── applicationApi.js         # applyToJob, getMyApplications, etc.
│   │   │   ├── authApi.js                # register, login, getMe
│   │   │   ├── axios.js                  # Axios instance with JWT interceptors
│   │   │   └── jobApi.js                 # getAllJobs, getJobById, etc.
│   │   ├── components/
│   │   │   ├── jobs/                     # JobCard, FilterBar
│   │   │   ├── layout/                   # Navbar, Footer
│   │   │   ├── ui/                       # Button, Input, Badge, EmptyState
│   │   │   ├── ApplyJobModal.jsx         # Candidate application submission modal
│   │   │   └── ProtectedRoute.jsx        # Auth & Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global user & token session provider
│   │   ├── layouts/                      # RootLayout.jsx
│   │   ├── pages/
│   │   │   ├── BrowseJobsPage.jsx        # Live jobs list with debounced search & pagination
│   │   │   ├── Dashboard.jsx             # User profile and session status dashboard
│   │   │   ├── HomePage.jsx              # Hero banner with live featured jobs
│   │   │   ├── JobDetailsPage.jsx        # Job description with role-aware Apply button
│   │   │   ├── Login.jsx                 # User sign in form with error banner
│   │   │   ├── NotFoundPage.jsx          # 404 handler
│   │   │   └── Register.jsx              # User registration with role selection
│   │   ├── App.jsx                       # Route declarations wrapped in AuthProvider
│   │   ├── index.css                     # Tailwind layers & design system styles
│   │   └── main.jsx                      # React entrypoint
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                               # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── applicationController.js  # Application management handlers
│   │   │   ├── authController.js         # Auth handlers (register, login, getMe)
│   │   │   └── jobController.js          # Job management handlers
│   │   ├── middleware/
│   │   │   ├── asyncHandler.js           # Async route wrapper
│   │   │   ├── authMiddleware.js         # protect & restrictTo RBAC
│   │   │   └── errorHandler.js           # 404 & global error handling
│   │   ├── models/
│   │   │   ├── Application.js            # Application schema with compound uniqueness
│   │   │   ├── Job.js                    # Job schema with text search index
│   │   │   └── User.js                   # User schema with bcrypt pre-save & toJSON
│   │   ├── routes/
│   │   │   ├── applicationRoutes.js      # /api/applications routes
│   │   │   ├── authRoutes.js             # /api/auth routes
│   │   │   ├── healthRoutes.js           # /api/health route
│   │   │   └── jobRoutes.js              # /api/jobs routes
│   │   ├── utils/
│   │   │   └── generateToken.js          # JWT signing utility
│   │   └── server.js                     # Express app setup & server initialization
│   ├── .env.example                      # Environment variables template
│   └── package.json
├── .gitignore                            # Root Git ignore rules
└── README.md                             # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v26+ supported)
- **npm**: v9.0.0 or later

### Installation

1. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Install Server Dependencies:**
   ```bash
   cd ../server
   npm install
   ```

3. **Configure Environment Variables:**
   - Client: `cp client/.env.example client/.env`
   - Server: `cp server/.env.example server/.env`

---

## Running the Applications

### Start the Frontend Client (Vite Dev Server)
```bash
cd client
npm run dev
```
The client will be running at [http://localhost:5173](http://localhost:5173).

### Start the Backend Server (Express + Nodemon)
```bash
cd server
npm run dev
```
The API server will be running at [http://localhost:5000](http://localhost:5000).
