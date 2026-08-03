-- Announcements
CREATE TABLE IF NOT EXISTS Announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  media_url TEXT,
  published BOOLEAN DEFAULT 0,
  archived BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(publisher_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS AnnouncementReadReceipts (
  user_id TEXT NOT NULL,
  announcement_id TEXT NOT NULL,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, announcement_id),
  FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY(announcement_id) REFERENCES Announcements(id) ON DELETE CASCADE
);

-- Permissions (Granular)
CREATE TABLE IF NOT EXISTS Permissions (
  user_id TEXT NOT NULL,
  permission TEXT NOT NULL, -- e.g., 'publish_announcements', 'manage_forums'
  PRIMARY KEY (user_id, permission),
  FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Audit Log
CREATE TABLE IF NOT EXISTS AuditLogs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE SET NULL
);
