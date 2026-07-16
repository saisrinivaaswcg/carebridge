# CareBridge API Contract — v0.1.0 (Day 1)

Owner: Backend (Express + PostgreSQL). This document is the source of truth for
anyone building against the API: mobile (React Native), dashboard (React),
realtime/voice service (Socket.io + S3), and the ML service.

Changes to this contract go through a PR against this file — don't build against
verbal agreements. Breaking changes bump the version prefix (`/api/v2/...`).

---

## 1. Conventions

- **Base URL:** `https://api.carebridge.sg/api/v1`
- **Format:** JSON in, JSON out. `Content-Type: application/json` except file/audio upload endpoints.
- **Auth:** `Authorization: Bearer <access_token>` on every endpoint except `/auth/*` and health checks.
- **IDs:** UUIDv4 strings everywhere.
- **Timestamps:** ISO 8601 UTC, e.g. `"2026-07-13T09:00:00Z"`.
- **Pagination:** cursor-based on list endpoints.
  - Query: `?limit=20&cursor=<opaque_cursor>`
  - Response envelope:
    ```json
    { "data": [ ... ], "next_cursor": "eyJ...", "has_more": true }
    ```
- **Errors:** consistent envelope, HTTP status + machine-readable code:
  ```json
  {
    "error": {
      "code": "CONSENT_REQUIRED",
      "message": "Family sharing consent has not been granted for this senior.",
      "details": {}
    }
  }
  ```
  Common codes: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403),
  `CONSENT_REQUIRED` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429),
  `INTERNAL_ERROR` (500).
- **Idempotency:** POST endpoints that create records from external systems (ML alerts,
  voice-note registration) accept an `Idempotency-Key` header; replays return the original
  201 response instead of creating a duplicate.

---

## 2. Roles & Actors

| Role | Description | Primary client |
|---|---|---|
| `senior` | The elderly end-user. Logs in via OTP. | Mobile app |
| `family` | Family member in a senior's care group. | Mobile app / Dashboard |
| `caseworker` | Assigned professional, may be linked to multiple seniors. | Dashboard |
| `admin` | Internal ops/support. | Dashboard (restricted views) |

Additionally, two **service accounts** (not human users) call the API:
`ml-service` and `realtime-service` — see §4 Service-to-Service Auth.

Authorization is **resource-scoped**, not just role-scoped: a `family` user can only
access a senior's data if they are an `active` member of that senior's `care_group`
with sufficient `permission_level`, **and** the relevant consent is `granted`.

---

## 3. Auth Flow (human users)

### Seniors — phone + OTP (no password, low friction for elderly users)
```
POST /auth/senior/otp/request      { phone_number }        → 200 (SMS sent)
POST /auth/senior/otp/verify       { phone_number, code }  → 200 { access_token, refresh_token, user }
```

### Family / Caseworker / Admin — email + password
```
POST /auth/login                   { email, password }     → 200 { access_token, refresh_token, user }
```

### Common
```
POST /auth/refresh                 { refresh_token }       → 200 { access_token, refresh_token }
POST /auth/logout                  { refresh_token }       → 204
```

**Token design:**
- Access token: JWT, 15 min TTL. Claims: `sub` (user id), `role`, `iat`, `exp`.
  Intentionally *no* per-resource permissions baked in — those are looked up live
  from `care_group_members` + `consent_records` so a revoked permission takes effect
  immediately rather than waiting for token expiry.
- Refresh token: opaque random string, stored **hashed** in `refresh_tokens`, 30 day
  TTL, rotated on every use (old one revoked, new one issued). Enables server-side
  revocation (e.g. lost phone, offboarded caseworker).
- Senior OTP: 6-digit code, hashed, 5 min TTL, max 5 attempts, rate-limited per phone number.

---

## 4. Service-to-Service Auth (ML service, realtime service)

These are trusted internal services, not end users — they authenticate with a
**service API key** (`X-Service-Key` header) issued out-of-band, mapped to a fixed
service identity, not a `users` row. Rate limits and IP allow-listing apply.
Endpoints marked **[internal]** below only accept this auth mode.

---

## 5. Endpoints

### 5.1 Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/senior/otp/request` | none | |
| POST | `/auth/senior/otp/verify` | none | |
| POST | `/auth/login` | none | family/caseworker/admin |
| POST | `/auth/refresh` | none (refresh token in body) | |
| POST | `/auth/logout` | access token | |

### 5.2 Users
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/users/me` | any role | |
| PATCH | `/users/me` | any role | name, language, contact info |

### 5.3 Seniors
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/seniors` | caseworker, admin | onboarding; creates `users` + `seniors` + `care_groups` row |
| GET | `/seniors/:seniorId` | care-group member | |
| PATCH | `/seniors/:seniorId` | caseworker, admin, or the senior | |
| GET | `/seniors` | caseworker, admin | caseworker sees their assigned seniors only |

### 5.4 Care Group
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/seniors/:seniorId/care-group/members` | care-group member | |
| POST | `/seniors/:seniorId/care-group/members` | senior, caseworker, admin | invite family/caseworker |
| PATCH | `/seniors/:seniorId/care-group/members/:userId` | senior, caseworker, admin | change permission_level |
| DELETE | `/seniors/:seniorId/care-group/members/:userId` | senior, caseworker, admin | soft-remove (status='removed') |

### 5.5 Consent — you own this end-to-end
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/seniors/:seniorId/consents` | care-group member (view-only fields), senior, caseworker | current status per `consent_type` |
| POST | `/seniors/:seniorId/consents` | senior, or guardian via caseworker-witnessed flow | grants a new consent record |
| PATCH | `/seniors/:seniorId/consents/:consentId` | senior, caseworker | `{ "action": "withdraw" | "renew" }` |
| GET | `/seniors/:seniorId/consents/:consentId/audit` | caseworker, admin | full audit trail, compliance use only |

Every write to `consent_records` also writes a row to `consent_audit_log`
(action, actor, IP, timestamp) — non-negotiable, enforced in the service layer
not left to callers.

### 5.6 Messages (text)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/seniors/:seniorId/messages` | care-group member w/ consent | paginated, consent-gated |
| POST | `/seniors/:seniorId/messages` **[internal]** | realtime-service | ingests inbound/outbound text |
| PATCH | `/seniors/:seniorId/messages/:id/ml-status` **[internal]** | ml-service | marks `ml_processed_at` |

### 5.7 Voice Notes
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/seniors/:seniorId/voice-notes` **[internal]** | realtime-service | registers metadata *after* S3 upload completes; body includes `s3_key`, `duration_seconds`, `recorded_at` |
| GET | `/seniors/:seniorId/voice-notes` | care-group member w/ consent | list, transcript included if `transcript_status=completed` |
| GET | `/seniors/:seniorId/voice-notes/:id` | care-group member w/ consent | |
| PATCH | `/seniors/:seniorId/voice-notes/:id/transcript` **[internal]** | ml-service or realtime-service | sets `transcript_text`, `transcript_status` |

### 5.8 Check-in Calls
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/seniors/:seniorId/check-ins` | care-group member | |
| POST | `/seniors/:seniorId/check-ins` | caseworker, admin | schedule |
| PATCH | `/seniors/:seniorId/check-ins/:id` | realtime-service **[internal]**, caseworker | status/timing updates |

### 5.9 Alerts
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/seniors/:seniorId/alerts` | care-group member w/ `family_sharing`/`caseworker_sharing` consent | filter by `status`, `severity` |
| POST | `/alerts` **[internal]** | ml-service | creates alert + fans out `alert_notifications` per care-group member permission |
| PATCH | `/alerts/:id` | care-group member with `full` or `alerts_only` permission | `{ "action": "acknowledge" | "resolve" | "dismiss", "resolution_notes"? }` |

**Non-diagnostic language rule:** `alerts.description` must always describe an
*observed pattern change*, never a medical conclusion — this is enforced in the ML
service's alert-creation payload validation on our side (reject if it matches a
disallowed-terms list), not just convention.

---

## 6. Consent & Retention — cross-cutting rules every teammate must respect

1. **Gate reads, not just writes.** Any endpoint returning message content, voice
   transcripts, or alerts must check for an active (`granted`, non-expired) consent
   record of the relevant `consent_type` before returning data. Missing consent →
   `403 CONSENT_REQUIRED`, not an empty list (empty list looks like "no data" and
   is misleading).
2. **Default retention windows (confirm with legal before launch, configurable in app layer):**
   - Raw voice audio: 90 days, then `audio_deleted_at` set and S3 object purged by realtime-service; transcript retained only if `voice_recording` consent's paired `ml_pattern_analysis` consent is still active.
   - Text messages / transcripts: retained for the lifetime of the account + 30 days after account closure, then hard-deleted.
   - Alerts: retained 1 year for care continuity, then anonymized (senior_id nulled, description generalized).
3. **Withdrawal is immediate and cascades:** withdrawing `ml_pattern_analysis` consent
   must stop the ML service from receiving new messages/voice-notes for that senior
   going forward (enforced by the consent-gate on the ingestion endpoints, not by
   asking ML service to self-police).
4. **Audit everything:** every read of `messages`, `voice_notes`, or `alerts` content
   by a human (not service accounts) writes an `access_audit_log` row. This is
   middleware, not per-route code — see `consentGate.js` in starter code.

---

## 7. What Each Teammate Needs From This Contract

- **Mobile (React Native):** §3 auth (OTP flow), §5.2–5.9 for senior + family views.
- **Dashboard (React):** §3 auth (email/password), §5.3–5.9, especially alerts + consent audit views for caseworkers.
- **Realtime/voice (Socket.io + S3):** §4 service auth, §5.6 (message ingestion), §5.7 (voice-note registration — upload to S3 first, then call our endpoint with the key), §5.8.
- **ML service:** §4 service auth, §5.6 (`ml-status` patch), §5.9 (`POST /alerts`), and the non-diagnostic language rule.

## 8. Open Questions (flag before you build against these)

- Guardian/proxy consent flow for seniors with cognitive impairment at onboarding — legal review needed, `proof_method='guardian_signed'` is a placeholder.
- Exact retention windows in §6.2 need legal/compliance sign-off, not just engineering defaults.
- Whether `admin` role needs a break-glass audit-logged override path for support tickets.

---
*Changelog: v0.1.0 — initial draft, day 1.*
