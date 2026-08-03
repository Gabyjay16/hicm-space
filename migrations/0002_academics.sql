-- Academics: Lecture Notes
CREATE TABLE IF NOT EXISTS Notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_key TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(uploader_id) REFERENCES Users(id) ON DELETE CASCADE
);
