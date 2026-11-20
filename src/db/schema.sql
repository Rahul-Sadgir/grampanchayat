-- Gram Panchayat Platform - PostgreSQL Database Schema
-- Database: gram_panchayat_db

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. VILLAGES
CREATE TABLE IF NOT EXISTS villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'महाराष्ट्र',
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    cover_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    primary_color VARCHAR(50) DEFAULT '#003625',
    secondary_color VARCHAR(50) DEFAULT '#9e4300',
    population VARCHAR(50),
    male_population VARCHAR(50),
    female_population VARCHAR(50),
    households VARCHAR(50),
    area VARCHAR(50),
    wards VARCHAR(50),
    literacy_rate VARCHAR(50),
    female_literacy VARCHAR(50),
    schools VARCHAR(50),
    distance_from_taluka VARCHAR(100),
    distance_from_district VARCHAR(100),
    sarpanch_message TEXT,
    speciality TEXT,
    highlight_notice TEXT,
    pride_highlights JSONB DEFAULT '[]'::jsonb,
    vision_points JSONB DEFAULT '[]'::jsonb,
    is_under_administrative_rule BOOLEAN DEFAULT FALSE,
    administrator_name VARCHAR(255),
    administrator_role VARCHAR(255) DEFAULT 'शासन नियुक्त प्रशासक',
    administrator_phone VARCHAR(50),
    administrator_email VARCHAR(100),
    administrator_order_details TEXT,
    administrator_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (Administrators)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'VILLAGE_ADMIN',
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    village_slug VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICES (Citizen Services)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_service_village_slug UNIQUE (village_id, slug)
);

-- 4. FORMS (Dynamic Form Schemas)
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    version INT DEFAULT 1,
    schema JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APPLICATIONS (Citizen Form Submissions)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(100) UNIQUE NOT NULL,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
    service_name VARCHAR(255),
    service_slug VARCHAR(100),
    village_slug VARCHAR(100),
    applicant_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    admin_notes TEXT,
    response_document_url TEXT,
    response_document_name TEXT,
    response_text TEXT,
    response_sent_at TIMESTAMPTZ,
    response_type VARCHAR(20) DEFAULT 'MESSAGE',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTICES (Public Notices & Announcements)
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'सूचना',
    file_url TEXT,
    is_important BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECTS (Development Works)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED',
    budget NUMERIC(15, 2) DEFAULT 0,
    year VARCHAR(50),
    agency VARCHAR(255),
    location VARCHAR(255),
    start_date DATE,
    completion_date DATE,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SCHEMES (Government Schemes)
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    description TEXT NOT NULL,
    subsidy_details TEXT,
    target_audience TEXT,
    eligibility TEXT,
    documents_required TEXT,
    application_process TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    content TEXT,
    faq JSONB DEFAULT '[]'::jsonb,
    external_link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_scheme_village_slug UNIQUE (village_id, slug)
);

-- 9. REPRESENTATIVES (Panchayat Body & Staff)
CREATE TABLE IF NOT EXISTS representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    photo_url TEXT,
    ward VARCHAR(100),
    is_sarpanch BOOLEAN DEFAULT FALSE,
    is_upasarpanch BOOLEAN DEFAULT FALSE,
    order_num INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EVENTS (Village Happenings, Functions & Blog Posts)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'उपक्रम',
    content TEXT NOT NULL,
    summary TEXT,
    location VARCHAR(255),
    event_date DATE DEFAULT CURRENT_DATE,
    cover_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_village_slug UNIQUE (village_id, slug)
);

-- 11. RTI_SPENDINGS (Right to Information - Spendings & Expenditure Disclosures)
CREATE TABLE IF NOT EXISTS rti_spendings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    village_slug VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    image_url TEXT NOT NULL,
    order_num INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for fast querying
CREATE INDEX IF NOT EXISTS idx_villages_slug ON villages(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_services_village ON services(village_id, is_active);
CREATE INDEX IF NOT EXISTS idx_applications_village ON applications(village_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_mobile ON applications(mobile_number);
CREATE INDEX IF NOT EXISTS idx_notices_village ON notices(village_id, is_active);
CREATE INDEX IF NOT EXISTS idx_projects_village ON projects(village_id, status);
CREATE INDEX IF NOT EXISTS idx_schemes_village ON schemes(village_id, is_active);
CREATE INDEX IF NOT EXISTS idx_representatives_village ON representatives(village_id, is_active, order_num);
CREATE INDEX IF NOT EXISTS idx_events_village ON events(village_id, is_active, event_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(village_slug, slug);
CREATE INDEX IF NOT EXISTS idx_rti_spendings_village ON rti_spendings(village_slug, is_active, order_num);

