# JobConnect — System Architecture

## 1. Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | React 18 + Vite (JavaScript)        |
| Styling     | Tailwind CSS                        |
| Routing     | React Router v6                     |
| State       | React Context (AuthContext only)    |
| HTTP client | Axios with JWT interceptor          |
| Icons       | Lucide React                        |
| Backend     | Node.js + Express (ES modules)      |
| Database    | MongoDB Atlas + Mongoose            |
| Auth        | JWT (jsonwebtoken) + bcryptjs       |
| Security    | Helmet, CORS allow-list             |
| Dev tooling | nodemon, dotenv                     |

## 2. Repository Layout

jobconnect/
├── client/     # React frontend
├── server/     # Express backend
├── docs/       # Architecture notes
└── README.md

## 3. Frontend Architecture

client/src/
├── api/            # axios.js plus per-resource API modules
├── components/     # ui/, layout/, dashboard/, jobs/, ProtectedRoute
├── context/        # AuthContext.jsx (the only global state)
├── layouts/        # RootLayout (Navbar + Footer shell)
├── pages/          # public pages and dashboard sub-pages
└── main.jsx        # AuthProvider plus Router

Patterns:
- One `api/<resource>.js` per backend domain — no raw axios calls inside components
- All authenticated requests go through `api/axios.js`; the request interceptor attaches the JWT
- 401 responses clear the session and redirect to `/login`, except on `/auth/login` and `/auth/register`
- Role-aware routes use `<ProtectedRoute roles={[...]}/>`; wrong-role users are redirected to their own dashboard
- `DashboardLayout` provides the role-scoped sidebar and top bar

## 4. Backend Architecture

server/src/
├── config/         # db.js (Mongoose connection)
├── controllers/    # auth, job, application, user, admin
├── middleware/     # asyncHandler, protect, restrictTo, errorHandler
├── models/         # User, Job, Application
├── routes/         # per-domain routers mounted in server.js
├── utils/          # generateToken
└── server.js

Patterns:
- Controllers wrap handlers in `asyncHandler` — no try/catch boilerplate
- `protect` verifies the JWT, loads the user, and attaches it to `req.user`
- `restrictTo(...roles)` enforces role-based access per route
- Ownership checks (poster or admin) live inside the controller
- Whitelist-based updates — never pass `req.body` directly to Mongoose

## 5. Data Model

User
- name, email (unique), password (hashed, `select: false`)
- role: jobseeker | employer | admin
- profile: headline, bio, location, skills[], resumeUrl, companyName, companyWebsite, companyLogo
- timestamps

Job
- title, description, requirements[], responsibilities[]
- company, location
- jobType: Full-time | Part-time | Contract | Internship | Remote
- category, salaryMin, salaryMax
- experienceLevel: Entry | Mid | Senior | Lead
- postedBy (ObjectId → User)
- status: open | closed
- applicationDeadline
- timestamps
- Indexes: text on (title, company, location, category); compound (category, jobType); postedBy

Application
- job (ObjectId → Job)
- applicant (ObjectId → User)
- status: pending | reviewed | shortlisted | rejected | hired
- coverLetter, resumeUrl
- timestamps
- Index: unique compound (job, applicant)

## 6. API Surface

Auth
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me          (protected)

Jobs
- GET    /api/jobs
- GET    /api/jobs/:id
- GET    /api/jobs/mine      (employer or admin)
- POST   /api/jobs           (employer or admin)
- PUT    /api/jobs/:id       (owner or admin)
- DELETE /api/jobs/:id       (owner or admin)

Applications
- POST   /api/applications                (jobseeker)
- GET    /api/applications/mine           (jobseeker)
- GET    /api/applications/job/:jobId     (owner employer or admin)
- PUT    /api/applications/:id/status     (owner employer or admin)
- DELETE /api/applications/:id            (applicant)

Users
- PUT /api/users/profile     (any authenticated user)

Admin
- GET    /api/admin/stats
- GET    /api/admin/users
- PATCH  /api/admin/users/:id/role
- DELETE /api/admin/users/:id
- GET    /api/admin/jobs
- PATCH  /api/admin/jobs/:id/status
- DELETE /api/admin/jobs/:id

Health
- GET /api/health

## 7. Auth Flow

1. Register or login — backend returns `{ status, token, user }` (flat, not nested)
2. Frontend stores both in `localStorage` under `jobconnect_auth` as a JSON object
3. `axios.js` request interceptor reads that key and attaches `Authorization: Bearer <token>`
4. `protect` middleware verifies the JWT, loads the user, attaches to `req.user`
5. `restrictTo(...)` checks `req.user.role`
6. On any 401 except `/auth/*`, the session clears and the user is redirected to `/login`

## 8. Cascade Deletes

- Delete job → `Application.deleteMany({ job: id })` → delete job
- Delete user → find their jobs → delete applications where `applicant: id OR job ∈ theirJobs` → delete their jobs → delete user

## 9. Environment Variables

server/.env (git-ignored; `.env.example` committed)
- PORT
- MONGO_URI
- JWT_SECRET
- NODE_ENV

client/.env (git-ignored)
- VITE_API_URL
