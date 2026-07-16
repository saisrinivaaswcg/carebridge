-- =============================================================================
-- CareBridge PostgreSQL Schema
-- Owner: Backend (you). Version: 0.1.0 (Day 1 contract)
--
-- Design notes:
--  - Every table that touches a senior's personal/health-adjacent data carries
--    a `retention_expires_at` (nullable) so a scheduled job can purge/anonymize
--    per PDPA data-minimization requirements. Defaults are set by the app layer,
--    not the DB, so retention policy can change without a migration.
--  - Soft delete (`deleted_at`) is used instead of hard delete on senior-linked
--    content, so we can honour "right to erasure" requests by nulling out
--    content columns while keeping a minimal audit trail (id, timestamps,
--    who/why) — confirm this pattern with legal/compliance before launch.
--  - `updated_at` is maintained via trigger, not application code.
-- =============================================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";       -- case-insensitive email

-- ---------- Enums ----------
CREATE TYPE user_role AS ENUM ('senior', 'family', 'caseworker', 'admin');
CREATE TYPE care_group_role AS ENUM ('family_primary', 'family_secondary', 'caseworker', 'admin_observer');
CREATE TYPE permission_level AS ENUM ('full', 'alerts_only', 'view_only');
CREATE TYPE member_status AS ENUM ('invited', 'active', 'removed');

CREATE TYPE consent_type AS ENUM (
  'data_collection',       -- baseline text/voice/call metadata collection
  'voice_recording',       -- storing raw audio (vs. transcript only)
  'ml_pattern_analysis',   -- passive ML analysis for drift/decline signals
  'family_sharing',        -- sharing signals with family members
  'caseworker_sharing',    -- sharing signals with assigned caseworker
  'emergency_override'     -- allow break-glass access in a detected emergency
);
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'withdrawn', 'expired');
CREATE TYPE proof_method AS ENUM ('in_app_digital', 'verbal_witnessed', 'paper_form', 'guardian_signed');

CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_channel AS ENUM ('sms', 'app_text', 'voice_transcript', 'check_in_call');
CREATE TYPE transcript_status AS ENUM ('not_applicable', 'pending', 'completed', 'failed');
CREATE TYPE checkin_status AS ENUM ('scheduled', 'completed', 'missed', 'cancelled');

CREATE TYPE alert_type AS ENUM (
  'communication_drop', 'sentiment_shift', 'missed_checkin',
  'keyword_flag', 'routine_change', 'other'
);
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved', 'dismissed');
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email');

-- ---------- updated_at trigger helper ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USERS  (auth identity for all human actors: senior, family, caseworker, admin)
-- =============================================================================
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role              user_role NOT NULL,
  phone_number      TEXT UNIQUE,                 -- E.164, primary login for seniors
  email             CITEXT UNIQUE,                -- primary login for family/caseworker/admin
  password_hash     TEXT,                         -- null for senior (OTP-only) accounts
  full_name         TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',  -- e.g. 'en', 'zh', 'ms', 'ta'
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_has_identifier CHECK (phone_number IS NOT NULL OR email IS NOT NULL)
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_users_role ON users(role);

-- ---------- One-time-password codes for senior login ----------
CREATE TABLE otp_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash     TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  consumed_at   TIMESTAMPTZ,
  attempt_count SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_user ON otp_codes(user_id, expires_at);

-- ---------- Refresh tokens (rotated, revocable) ----------
CREATE TABLE refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  device_info   TEXT,
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- =============================================================================
-- SENIORS  (health-adjacent profile, 1:1 extension of a `users` row)
-- =============================================================================
CREATE TABLE seniors (
  id                    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth         DATE,
  timezone              TEXT NOT NULL DEFAULT 'Asia/Singapore',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  baseline_established_at TIMESTAMPTZ,   -- set once ML service has enough data
  onboarding_status     TEXT NOT NULL DEFAULT 'pending', -- pending|active|paused|offboarded
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_seniors_updated_at BEFORE UPDATE ON seniors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- CARE GROUPS  (the circle of people around one senior)
-- =============================================================================
CREATE TABLE care_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id   UUID NOT NULL UNIQUE REFERENCES seniors(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE care_group_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_group_id     UUID NOT NULL REFERENCES care_groups(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_group     care_group_role NOT NULL,
  permission_level  permission_level NOT NULL DEFAULT 'alerts_only',
  status            member_status NOT NULL DEFAULT 'invited',
  invited_by        UUID REFERENCES users(id),
  joined_at         TIMESTAMPTZ,
  removed_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (care_group_id, user_id)
);
CREATE INDEX idx_care_group_members_user ON care_group_members(user_id);
CREATE INDEX idx_care_group_members_group ON care_group_members(care_group_id, status);

-- =============================================================================
-- CONSENT RECORDS  (granular, versioned, per PDPA — you own this table)
-- =============================================================================
CREATE TABLE consent_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id         UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  consent_type      consent_type NOT NULL,
  status            consent_status NOT NULL DEFAULT 'pending',
  consent_version   TEXT NOT NULL,             -- e.g. 'v1.2' of the consent copy shown
  granted_by_user_id UUID NOT NULL REFERENCES users(id), -- senior, or legal guardian
  proof_method      proof_method NOT NULL,
  witness_user_id   UUID REFERENCES users(id), -- e.g. caseworker who witnessed verbal consent
  granted_at        TIMESTAMPTZ,
  withdrawn_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,               -- e.g. re-consent required annually
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_consent_records_updated_at BEFORE UPDATE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Only one active (granted, non-expired) consent per senior+type at a time
CREATE UNIQUE INDEX uq_active_consent_per_type
  ON consent_records(senior_id, consent_type)
  WHERE status = 'granted';
CREATE INDEX idx_consent_senior ON consent_records(senior_id, consent_type, status);

-- Immutable audit trail of every consent state change / access to consent state
CREATE TABLE consent_audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_record_id UUID NOT NULL REFERENCES consent_records(id) ON DELETE CASCADE,
  action            TEXT NOT NULL, -- 'granted' | 'withdrawn' | 'renewed' | 'expired' | 'viewed'
  performed_by_user_id UUID REFERENCES users(id),
  performed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address        INET,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_consent_audit_record ON consent_audit_log(consent_record_id);

-- =============================================================================
-- MESSAGES  (text: SMS + in-app text; voice notes/calls reference this too)
-- =============================================================================
CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id           UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  direction           message_direction NOT NULL,
  channel             message_channel NOT NULL,
  content_text        TEXT,                 -- null once redacted/expired
  sent_at             TIMESTAMPTZ NOT NULL,
  ml_processed_at     TIMESTAMPTZ,          -- set by ML service once analysed
  retention_expires_at TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_senior_time ON messages(senior_id, sent_at DESC);
CREATE INDEX idx_messages_unprocessed ON messages(senior_id) WHERE ml_processed_at IS NULL;

-- =============================================================================
-- VOICE NOTES  (metadata only — audio bytes live in S3, owned by realtime svc)
-- =============================================================================
CREATE TABLE voice_notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id           UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  message_id          UUID REFERENCES messages(id) ON DELETE SET NULL,
  s3_key              TEXT NOT NULL,
  s3_bucket           TEXT NOT NULL,
  duration_seconds    INTEGER NOT NULL,
  transcript_text     TEXT,
  transcript_status   transcript_status NOT NULL DEFAULT 'pending',
  recorded_at         TIMESTAMPTZ NOT NULL,
  retention_expires_at TIMESTAMPTZ,   -- raw audio typically purged before transcript
  audio_deleted_at    TIMESTAMPTZ,   -- audio purged, transcript may remain per consent
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_voice_notes_senior_time ON voice_notes(senior_id, recorded_at DESC);

-- =============================================================================
-- CHECK-IN CALLS  (scheduled voice check-ins)
-- =============================================================================
CREATE TABLE check_in_calls (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id         UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  status            checkin_status NOT NULL DEFAULT 'scheduled',
  recording_s3_key  TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_checkins_updated_at BEFORE UPDATE ON check_in_calls
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_checkins_senior_time ON check_in_calls(senior_id, scheduled_at DESC);
CREATE INDEX idx_checkins_status ON check_in_calls(status) WHERE status = 'scheduled';

-- =============================================================================
-- ALERTS  (ML/system-generated signals surfaced to humans; never a diagnosis)
-- =============================================================================
CREATE TABLE alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id           UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  alert_type          alert_type NOT NULL,
  severity            alert_severity NOT NULL DEFAULT 'low',
  description         TEXT NOT NULL,       -- human-readable, non-diagnostic language
  source              TEXT NOT NULL,       -- 'ml_service' | 'checkin_system' | 'manual'
  detected_at         TIMESTAMPTZ NOT NULL,
  status              alert_status NOT NULL DEFAULT 'open',
  acknowledged_by_user_id UUID REFERENCES users(id),
  acknowledged_at     TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  resolution_notes    TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"deviation_score": 2.3}
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_alerts_senior_status ON alerts(senior_id, status, detected_at DESC);

CREATE TABLE alert_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id        UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES users(id),
  channel         notification_channel NOT NULL,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alert_notifications_alert ON alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_recipient ON alert_notifications(recipient_user_id, read_at);

-- =============================================================================
-- GENERAL AUDIT LOG  (who accessed what health-adjacent resource, when)
-- =============================================================================
CREATE TABLE access_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  action        TEXT NOT NULL,        -- 'read' | 'create' | 'update' | 'delete'
  resource_type TEXT NOT NULL,        -- 'messages' | 'voice_notes' | 'alerts' | 'consent_records' ...
  resource_id   UUID,
  senior_id     UUID REFERENCES seniors(id),
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_access_audit_senior ON access_audit_log(senior_id, created_at DESC);
