CREATE TABLE battery_completions (student_id TEXT PRIMARY KEY NOT NULL, completed_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE classroom_meta (key TEXT PRIMARY KEY NOT NULL, value INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE teacher_sessions (token_hash TEXT PRIMARY KEY NOT NULL, expires_at INTEGER NOT NULL, reset_nonce_hash TEXT);
--> statement-breakpoint
CREATE TABLE teacher_login_attempts (attempt_key TEXT PRIMARY KEY NOT NULL, failures INTEGER NOT NULL, window_start INTEGER NOT NULL);
