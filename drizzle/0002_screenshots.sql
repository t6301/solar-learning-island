CREATE TABLE screenshots (id TEXT PRIMARY KEY NOT NULL, student_id TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE, mime_type TEXT NOT NULL, size INTEGER NOT NULL, created_at INTEGER NOT NULL, reset_version INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX screenshots_by_student ON screenshots(student_id, created_at);
--> statement-breakpoint
CREATE TABLE screenshot_completions (student_id TEXT PRIMARY KEY NOT NULL, completed_at INTEGER NOT NULL);
