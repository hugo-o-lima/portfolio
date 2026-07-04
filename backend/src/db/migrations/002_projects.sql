CREATE TABLE IF NOT EXISTS projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  tech_stack    TEXT[]      NOT NULL DEFAULT '{}',
  github_url    TEXT,
  live_url      TEXT,
  image_url     TEXT,
  display_order INTEGER     NOT NULL DEFAULT 0,
  published     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
