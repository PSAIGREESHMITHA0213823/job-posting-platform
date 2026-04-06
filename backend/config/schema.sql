-- Run this file in psql: psql -U postgres -d jobportal -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'company_manager', 'employee');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'paused');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role user_role NOT NULL,
is_active BOOLEAN DEFAULT true,
is_verified BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_profiles (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
full_name VARCHAR(255) NOT NULL,
phone VARCHAR(20),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_plans (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name subscription_plan DEFAULT 'free',
max_job_postings INT DEFAULT 3,
max_applications_per_job INT DEFAULT 50,
price DECIMAL(10,2) DEFAULT 0.00,
duration_days INT DEFAULT 30,
features JSONB DEFAULT '{}',
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE companies (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
slug VARCHAR(255) UNIQUE,
description TEXT,
industry VARCHAR(100),
company_size VARCHAR(50),
website VARCHAR(255),
logo_url VARCHAR(500),
address TEXT,
city VARCHAR(100),
country VARCHAR(100),
subscription_plan_id UUID REFERENCES subscription_plans(id),
subscription_expires_at TIMESTAMP,
is_verified BOOLEAN DEFAULT false,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE company_managers (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
full_name VARCHAR(255) NOT NULL,
phone VARCHAR(20),
position VARCHAR(100),
is_owner BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employee_profiles (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
full_name VARCHAR(255) NOT NULL,
phone VARCHAR(20),
headline VARCHAR(255),
summary TEXT,
location VARCHAR(255),
date_of_birth DATE,
gender VARCHAR(20),
resume_url VARCHAR(500),
profile_picture_url VARCHAR(500),
skills TEXT[],
experience_years INT DEFAULT 0,
education JSONB DEFAULT '[]',
work_experience JSONB DEFAULT '[]',
social_links JSONB DEFAULT '{}',
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_postings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
posted_by UUID REFERENCES company_managers(id),
title VARCHAR(255) NOT NULL,
slug VARCHAR(255),
description TEXT NOT NULL,
requirements TEXT,
responsibilities TEXT,
employment_type employment_type DEFAULT 'full_time',
location VARCHAR(255),
is_remote BOOLEAN DEFAULT false,
salary_min DECIMAL(12,2),
salary_max DECIMAL(12,2),
salary_currency VARCHAR(10) DEFAULT 'USD',
experience_required INT DEFAULT 0,
skills_required TEXT[],
category VARCHAR(100),
openings INT DEFAULT 1,
status job_status DEFAULT 'draft',
views INT DEFAULT 0,
application_deadline DATE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_applications (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,
cover_letter TEXT,
resume_url VARCHAR(500),
status application_status DEFAULT 'pending',
rejection_reason TEXT,
applied_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
UNIQUE(job_id, employee_id)
);

CREATE TABLE saved_jobs (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,
job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
saved_at TIMESTAMP DEFAULT NOW(),
UNIQUE(employee_id, job_id)
);

CREATE TABLE payments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
company_id UUID REFERENCES companies(id),
plan_id UUID REFERENCES subscription_plans(id),
amount DECIMAL(10,2) NOT NULL,
currency VARCHAR(10) DEFAULT 'USD',
status VARCHAR(50) DEFAULT 'pending',
payment_method VARCHAR(50),
transaction_id VARCHAR(255),
paid_at TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
title VARCHAR(255) NOT NULL,
message TEXT NOT NULL,
is_read BOOLEAN DEFAULT false,
type VARCHAR(50),
reference_id UUID,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_company ON job_postings(company_id);
CREATE INDEX idx_jobs_status ON job_postings(status);
CREATE INDEX idx_jobs_category ON job_postings(category);
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_employee ON job_applications(employee_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

INSERT INTO subscription_plans (name, max_job_postings, max_applications_per_job, price, duration_days, features)
VALUES
('free', 3, 20, 0.00, 9999, '{"featured_jobs": false, "analytics": false}'),
('basic', 10, 100, 29.99, 30, '{"featured_jobs": false, "analytics": true}'),
('pro', 50, 500, 79.99, 30, '{"featured_jobs": true, "analytics": true}'),
('enterprise', 999, 9999, 199.99, 30, '{"featured_jobs": true, "analytics": true, "priority_support": true}');

INSERT INTO users (email, password, role, is_active, is_verified)
VALUES ('admin@jobportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, true);
