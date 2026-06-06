-- DPDP Act 2023 §12 + AI budget — additive only, no DROP

-- 1. Soft-delete column on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 2. Data deletion audit log (7-year retention per GST Rule 46 equivalent)
CREATE TABLE IF NOT EXISTS "data_deletion_logs" (
  "id"          SERIAL PRIMARY KEY,
  "userId"      TEXT          NOT NULL,
  "emailHash"   TEXT          NOT NULL,
  "requestedAt" TIMESTAMP(3)  NOT NULL DEFAULT NOW(),
  "requesterIp" TEXT,
  "note"        TEXT,
  "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "data_deletion_logs_userId_idx"      ON "data_deletion_logs" ("userId");
CREATE INDEX IF NOT EXISTS "data_deletion_logs_requestedAt_idx" ON "data_deletion_logs" ("requestedAt");

-- 3. AI spend log — per-user per-month cost tracking
CREATE TABLE IF NOT EXISTS "ai_spend_logs" (
  "id"            BIGSERIAL PRIMARY KEY,
  "userId"        TEXT          NOT NULL,
  "model"         TEXT          NOT NULL DEFAULT 'claude-cli',
  "inputTokens"   INTEGER       NOT NULL DEFAULT 0,
  "outputTokens"  INTEGER       NOT NULL DEFAULT 0,
  "costInr"       NUMERIC(10,4) NOT NULL DEFAULT 0,
  "cliEstimated"  BOOLEAN       NOT NULL DEFAULT TRUE,
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "ai_spend_logs_userId_idx"    ON "ai_spend_logs" ("userId");
CREATE INDEX IF NOT EXISTS "ai_spend_logs_createdAt_idx" ON "ai_spend_logs" ("createdAt");
