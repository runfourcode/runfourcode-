CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY,
  uid TEXT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  website VARCHAR(200),
  project_type VARCHAR(100) NOT NULL,
  budget VARCHAR(50),
  idea VARCHAR(2000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW'
    CHECK (status IN ('NEW', 'REPLIED', 'IN PROGRESS', 'CLOSED')),
  deployed_url VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inquiries_uid_created_at_idx
  ON inquiries (uid, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx
  ON inquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('client', 'admin')),
  sender_name VARCHAR(100) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS messages_inquiry_created_at_idx
  ON messages (inquiry_id, created_at ASC);

CREATE TABLE IF NOT EXISTS site_content (
  id VARCHAR(20) PRIMARY KEY,
  hero_title VARCHAR(200) NOT NULL,
  hero_subtitle VARCHAR(1000) NOT NULL,
  positioning_headline VARCHAR(300) NOT NULL,
  positioning_body VARCHAR(2000) NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  ip_hash CHAR(64) NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, window_start)
);