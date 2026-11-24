CREATE TABLE sessions (token_hash TEXT PRIMARY KEY NOT NULL, student_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE completions (student_id TEXT NOT NULL, island INTEGER NOT NULL CHECK(island BETWEEN 0 AND 3), completed_at INTEGER NOT NULL, PRIMARY KEY(student_id, island));
