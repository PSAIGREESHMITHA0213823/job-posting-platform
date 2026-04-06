# Job Portal Backend

Node.js + Express + PostgreSQL REST API

## Stack
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- Auth: JWT (jsonwebtoken)
- File Uploads: Multer
- Password Hashing: bcryptjs

---

## Project Structure

```
jobportal/
├── server.js                        # Entry point
├── .env.example                     # Env variables template
├── config/
│   ├── db.js                        # PostgreSQL pool connection
│   └── schema.sql                   # Full DB schema (run this first)
├── middleware/
│   ├── auth.js                      # JWT auth + role guard
│   └── upload.js                    # Multer resume/logo upload
├── routes/
│   ├── auth.js                      # /api/auth/*
│   ├── admin/index.js               # /api/admin/*
│   ├── company/index.js             # /api/company/*
│   └── employee/index.js            # /api/employee/*
├── controllers/
│   ├── admin/admin.controller.js
│   ├── company/company.controller.js
│   └── employee/employee.controller.js
├── utils/
│   └── helpers.js
└── uploads/
    ├── resumes/
    └── logos/
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create PostgreSQL database
```bash
createdb jobportal
psql -U postgres -d jobportal -f config/schema.sql
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
```

### 4. Start server
```bash
npm run dev     # development with nodemon
npm start       # production
```

---

## API Endpoints

### Auth  `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | /register/employee | Register job seeker |
| POST | /register/company | Register company manager |
| POST | /login | Login (all roles) |
| GET | /me | Get current user + profile |

### Admin  `/api/admin`  *(requires admin token)*
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Revenue + platform stats |
| GET | /companies | List all companies |
| PATCH | /companies/:id/toggle | Activate/deactivate company |
| PATCH | /companies/:id/verify | Verify company |
| GET | /users | List all users |
| PATCH | /users/:id/toggle | Activate/deactivate user |
| GET | /plans | List subscription plans |
| PUT | /plans/:id | Update plan pricing/limits |
| GET | /payments | View all payments |

### Company  `/api/company`  *(requires company_manager token)*
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Jobs + applications stats |
| GET | /profile | Get company profile |
| PUT | /profile | Update profile + upload logo |
| GET | /jobs | List company's jobs |
| POST | /jobs | Create job posting |
| PUT | /jobs/:id | Update job posting |
| DELETE | /jobs/:id | Delete job posting |
| GET | /jobs/:jobId/applicants | View job applicants |
| PATCH | /applications/:appId/status | Update application status |

### Employee  `/api/employee`  *(requires employee token)*
| Method | Path | Description |
|--------|------|-------------|
| GET | /profile | Get employee profile |
| PUT | /profile | Update profile + upload resume |
| GET | /jobs | Browse jobs (with filters) |
| GET | /jobs/:id | Get single job detail |
| POST | /apply | Apply to a job |
| GET | /applications | My applications + status |
| POST | /jobs/:jobId/save | Toggle save/unsave job |
| GET | /saved-jobs | List saved jobs |
| GET | /notifications | Get notifications |

---

## Job Browse Filters  (GET /api/employee/jobs)
```
?search=developer
?category=engineering
?employment_type=full_time
?location=new york
?is_remote=true
?salary_min=50000
?experience=3
?page=1&limit=20
```

---

## Application Status Flow
```
pending → reviewed → shortlisted → hired
                  ↘ rejected
```

---

## Default Admin Account
```
Email: admin@jobportal.com
Password: password
```
Change this immediately in production.

---

## Subscription Plans (seeded)
| Plan | Jobs | Apps/Job | Price |
|------|------|----------|-------|
| free | 3 | 20 | $0 |
| basic | 10 | 100 | $29.99/mo |
| pro | 50 | 500 | $79.99/mo |
| enterprise | unlimited | unlimited | $199.99/mo |
