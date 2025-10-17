DROP TYPE IF EXISTS donation_type;

CREATE TYPE donation_type AS ENUM ('Offering','Tithe','Missions','Building Fund');

CREATE TABLE IF NOT EXISTS tithes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          INTEGER NOT NULL REFERENCES "user"(id),
  church_id        INTEGER NOT NULL REFERENCES church(id),
  amount           NUMERIC(12,2) NOT NULL,
  type             donation_type NOT NULL,
  is_success       BOOLEAN NOT NULL,
  datetime_created TIMESTAMPTZ NOT NULL DEFAULT now(),
  datetime_updated TIMESTAMPTZ
);