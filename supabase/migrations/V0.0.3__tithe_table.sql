DROP TABLE IF EXISTS "user";
CREATE TABLE IF NOT EXISTS "user" (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
  username         TEXT UNIQUE NOT NULL,
  password         TEXT NOT NULL,
  first_name       TEXT NOT NULL,
  middle_name      TEXT,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  datetime_created TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  datetime_updated TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE  "user" IS 'Information on a user';
COMMENT ON COLUMN "user".id IS 'Unique ID for a user';
COMMENT ON COLUMN "user".first_name IS 'User first name';
COMMENT ON COLUMN "user".middle_name IS 'User middle name';
COMMENT ON COLUMN "user".last_name IS 'User last name';
COMMENT ON COLUMN "user".phone IS 'User phone number';
COMMENT ON COLUMN "user".email IS 'User email';

DROP TABLE IF EXISTS church;
CREATE TABLE IF NOT EXISTS church(
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
  ein              TEXT NOT NULL,
  name             TEXT NOT NULL,
  address          TEXT,
  phone            TEXT,
  email            TEXT,
  location_id      BIGINT,
  admin_user_id    BIGINT REFERENCES "user"(id),
  validated        BOOLEAN DEFAULT FALSE,
  datetime_created TIMESTAMPTZ DEFAULT NOW(),
  datetime_updated TIMESTAMPTZ
);

COMMENT ON TABLE  church IS 'Information on a church';
COMMENT ON COLUMN church.id IS 'Unique ID for a church';
COMMENT ON COLUMN church.ein IS 'ein number for the church this could also contain a unique constraint';
COMMENT ON COLUMN church.name IS 'Display name for the church';
COMMENT ON COLUMN church.address IS 'Physical address of the church';
COMMENT ON COLUMN church.phone IS 'Phone number to display for the church';
COMMENT ON COLUMN church.email IS 'Contact email to display for the church';
COMMENT ON COLUMN church.location_id IS 'location id that will map back to a locations table with geocoordinates if we end up doing this';
COMMENT ON COLUMN church.admin_user_id IS 'A single main admin for the church, this admin can add or remove other admins';
COMMENT ON COLUMN church.validated IS 'Default false once the church is validated this will be true';

DROP TABLE IF EXISTS admin;
CREATE TABLE IF NOT EXISTS admin(
  user_id          UUID NOT NULL REFERENCES "user"(id),
  church_id        UUID NOT NULL REFERENCES church(id),
  modified_by      UUID NOT NULL REFERENCES "user"(id),
  datetime_created TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  datetime_updated TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE admin IS 'Information on a user church relationship to show dashboard if the user has priveledges';
COMMENT ON COLUMN admin.user_id IS 'User ID who holds a role';
COMMENT ON COLUMN admin.church_id IS 'Church ID in which the role is assigned for';
COMMENT ON COLUMN admin.modified_by IS 'User who authorized or removed the role';


DROP TYPE IF EXISTS donation_type;

CREATE TYPE donation_type AS ENUM ('Offering','Tithe','Missions','Building Fund');

CREATE TABLE IF NOT EXISTS tithes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES "user"(id),
  church_id        UUID NOT NULL REFERENCES church(id),
  amount           NUMERIC(12,2) NOT NULL,
  type             donation_type NOT NULL,
  is_success       BOOLEAN NOT NULL,
  datetime_created TIMESTAMPTZ NOT NULL DEFAULT now(),
  datetime_updated TIMESTAMPTZ
);