-- =============================================
-- iingApp Phase 1 Schema
-- 14 tables + 1 materialized view
-- =============================================

-- 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- USERS ----------
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL UNIQUE,
  display_name        TEXT,
  timezone            TEXT NOT NULL DEFAULT 'Asia/Seoul',
  pin_hash            TEXT,
  pin_attempts        SMALLINT NOT NULL DEFAULT 0,
  pin_locked_until    TIMESTAMPTZ,
  vacation_until      TIMESTAMPTZ,
  proficiency_test    TEXT CHECK (proficiency_test IN
                        ('opic','toeic_sp','toefl_ibt','ielts','self','none')),
  proficiency_score   TEXT,
  cefr_level          TEXT CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  tested_at           DATE,
  target_test         TEXT,
  target_score        TEXT,
  target_date         DATE,
  goal_note           TEXT,
  native_lang         TEXT NOT NULL DEFAULT 'ko',
  onboarding_done     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CONTENT_SERIES ----------
CREATE TABLE content_series (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title_ko      TEXT NOT NULL,
  title_en      TEXT,
  category      TEXT NOT NULL CHECK (category IN
                  ('grammar','conversation','speech','youtube')),
  cover_url     TEXT,
  episode_count INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CONTENT_EPISODES ----------
CREATE TABLE content_episodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id       UUID NOT NULL REFERENCES content_series(id) ON DELETE CASCADE,
  episode_no      INT NOT NULL,
  title           TEXT NOT NULL,
  audio_url       TEXT,
  duration_sec    INT,
  transcript_url  TEXT,
  ingest_status   TEXT NOT NULL DEFAULT 'pending'
                  CHECK (ingest_status IN ('pending','processing','ready','failed')),
  source_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (series_id, episode_no)
);

-- ---------- SENTENCES ----------
CREATE TABLE sentences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id     UUID NOT NULL REFERENCES content_episodes(id) ON DELETE CASCADE,
  idx            INT NOT NULL,
  start_ms       INT NOT NULL,
  end_ms         INT NOT NULL,
  text_en        TEXT NOT NULL,
  text_ko        TEXT,
  grammar_tags   TEXT[] NOT NULL DEFAULT '{}',
  difficulty     SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  quiz_eligible  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (episode_id, idx)
);

CREATE INDEX idx_sentences_episode ON sentences(episode_id);

-- ---------- SCHEDULE_SLOTS ----------
CREATE TABLE schedule_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekday      SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  method       TEXT NOT NULL CHECK (method IN
                  ('shadowing','quiz_new','quiz_review','dictation',
                   'chunk_drill','free')),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_user_weekday ON schedule_slots(user_id, weekday);

-- ---------- SLOT_CONTENT_MAP ----------
CREATE TABLE slot_content_map (
  slot_id    UUID NOT NULL REFERENCES schedule_slots(id) ON DELETE CASCADE,
  series_id  UUID NOT NULL REFERENCES content_series(id),
  priority   SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (slot_id, series_id)
);

-- ---------- SESSIONS ----------
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id           UUID REFERENCES schedule_slots(id) ON DELETE SET NULL,
  episode_id        UUID NOT NULL REFERENCES content_episodes(id),
  method            TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress','completed','abandoned','postponed')),
  resume_position   INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_started ON sessions(user_id, started_at DESC);

-- ---------- ATTEMPTS ----------
CREATE TABLE attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sentence_id     UUID NOT NULL REFERENCES sentences(id),
  user_answer     TEXT NOT NULL,
  input_mode      TEXT NOT NULL CHECK (input_mode IN ('voice','typing')),
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  ai_feedback     TEXT,
  flagged         BOOLEAN NOT NULL DEFAULT FALSE,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_sentence ON attempts(sentence_id);
CREATE INDEX idx_attempts_session ON attempts(session_id);

-- ---------- ERROR_TAGS ----------
CREATE TABLE error_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id    UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN
                  ('tense','article','preposition','word_order','word_choice',
                   'agreement','spelling','capitalization','punctuation','idiomatic')),
  severity      SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 3),
  user_part     TEXT,
  correct_part  TEXT,
  note          TEXT
);

CREATE INDEX idx_error_tags_attempt ON error_tags(attempt_id);

-- ---------- BOOKMARKS ----------
CREATE TABLE bookmarks (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sentence_id  UUID NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sentence_id)
);

-- ---------- VOCABULARY ----------
CREATE TABLE vocabulary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sentence_id     UUID REFERENCES sentences(id),
  phrase          TEXT NOT NULL,
  meaning_ko      TEXT,
  encounter_count INT NOT NULL DEFAULT 1,
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phrase)
);

-- ---------- RECORDINGS ----------
CREATE TABLE recordings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id   UUID REFERENCES attempts(id) ON DELETE SET NULL,
  session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sentence_id  UUID NOT NULL REFERENCES sentences(id),
  audio_url    TEXT NOT NULL,
  stt_text     TEXT,
  similarity   NUMERIC(4,3),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- MONTHLY_REPORTS ----------
CREATE TABLE monthly_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month            DATE NOT NULL,
  stats_json       JSONB NOT NULL,
  ai_advice        TEXT,
  recommendations  JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

-- ---------- INGESTION_JOBS ----------
CREATE TABLE ingestion_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id   UUID NOT NULL REFERENCES content_episodes(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'queued'
               CHECK (status IN ('queued','running','done','failed')),
  error        TEXT,
  started_at   TIMESTAMPTZ,
  finished_at  TIMESTAMPTZ,
  retry_count  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingestion_status ON ingestion_jobs(status);

-- ---------- WEAKNESS_SCORES (materialized view) ----------
CREATE MATERIALIZED VIEW weakness_scores AS
SELECT
  a.sentence_id,
  s.user_id,
  SUM(
    et.severity
    * EXP(-EXTRACT(EPOCH FROM (now() - a.created_at)) / 86400.0 * 0.3)
  ) AS score,
  MAX(a.created_at)                     AS last_attempted,
  0                                     AS correct_streak,
  FALSE                                 AS graduated
FROM attempts a
JOIN sessions s ON s.id = a.session_id
JOIN error_tags et ON et.attempt_id = a.id
WHERE a.flagged = FALSE
GROUP BY a.sentence_id, s.user_id;

CREATE UNIQUE INDEX idx_weakness_pk
  ON weakness_scores(sentence_id, user_id);

CREATE OR REPLACE FUNCTION refresh_weakness_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY weakness_scores;
END;
$$;

-- ---------- RLS ----------
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary          ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports     ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_self_select  ON users           FOR SELECT  USING (auth.uid() = id);
CREATE POLICY user_self_update  ON users           FOR UPDATE  USING (auth.uid() = id);

CREATE POLICY slots_self        ON schedule_slots  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY sessions_self     ON sessions        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY attempts_self     ON attempts
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM sessions WHERE sessions.id = attempts.session_id)
  );
CREATE POLICY error_tags_self   ON error_tags
  FOR ALL USING (
    auth.uid() = (
      SELECT s.user_id FROM sessions s
      JOIN attempts a ON a.session_id = s.id
      WHERE a.id = error_tags.attempt_id
    )
  );
CREATE POLICY bookmarks_self    ON bookmarks       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY vocabulary_self   ON vocabulary      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY recordings_self   ON recordings
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM sessions WHERE sessions.id = recordings.session_id)
  );
CREATE POLICY reports_self      ON monthly_reports FOR ALL USING (auth.uid() = user_id);

ALTER TABLE content_series   ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences        ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_read_all   ON content_series   FOR SELECT USING (TRUE);
CREATE POLICY episodes_read_all  ON content_episodes FOR SELECT USING (TRUE);
CREATE POLICY sentences_read_all ON sentences        FOR SELECT USING (TRUE);
