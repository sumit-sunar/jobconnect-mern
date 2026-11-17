# JobConnect — Product Requirements Document (PRD)

## 1. Vision
JobConnect is a full-stack job portal that connects job seekers, employers, and platform administrators in a single, role-aware experience.

Built as a portfolio-grade MERN project to demonstrate production patterns: authentication, role-based access control, REST API design, pagination, search/filter, and a clean component-driven frontend.

## 2. Target Users

| Role       | Who they are            | What they need                                |
| ---------- | ----------------------- | --------------------------------------------- |
| Job Seeker | Anyone looking for a job | Search jobs, apply, track application status |
| Employer   | Companies or recruiters  | Post jobs, manage listings, review applicants |
| Admin      | Platform operator        | Oversee users, jobs, and platform activity    |

## 3. Core Features (v1)

### Public
- Home page with hero and featured jobs
- Browse jobs with search, filter, sort, pagination
- Job details page with a role-aware "Apply" action

### Authentication
- Register (jobseeker or employer only — no public admin signup)
- Login with email and password (bcrypt hashed)
- JWT-based sessions (7-day expiry)
- Protected and role-based routes on both frontend and backend

### Job Seeker
- Profile: headline, bio, location, skills, resume URL
- Apply to jobs (cover letter and resume URL, one application per job)
- Track applications: pending / reviewed / shortlisted / rejected / hired
- Withdraw an application

### Employer
- Post, edit, and delete job listings
- Toggle job status (open / closed)
- View applicants per job with candidate info, resume, and cover letter
- Update application status per applicant

### Admin
- Platform stats (users, jobs, applications, last-7-day trends)
- Manage users (search, filter, change role, delete with cascade)
- Manage jobs (search, filter, toggle status, delete with cascade)
- Guardrails: cannot demote or delete self

## 4. Out of Scope (v1)
- In-app messaging or chat
- Payments or premium listings
- Resume file uploads (URL only in v1)
- Real-time notifications (in-app toast only)
- Third-party integrations (ATS, LinkedIn import)
- Native mobile app

## 5. Non-Functional Requirements
- Responsive down to 360px width
- Fast first meaningful paint on local network
- No plaintext passwords, no secrets in the repository
- Whitelisted update payloads — never trust raw `req.body`
- Consistent JSON API errors: `{ status: "fail", message: "..." }`

## 6. Success Criteria
- A reviewer can register, post a job, apply to it, and manage it end-to-end in under five minutes
- All API endpoints documented in the README with status codes
- No hardcoded secrets or URLs in source
- Codebase is understandable without an author walkthrough
