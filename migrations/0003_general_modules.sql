-- Complaints Desk
CREATE TABLE IF NOT EXISTS Complaints (
  id TEXT PRIMARY KEY,
  matricule TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  proof_url TEXT,
  status TEXT DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(matricule) REFERENCES Users(matricule) ON DELETE CASCADE
);

-- Chat Forums
CREATE TABLE IF NOT EXISTS ForumPosts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Voting / Polls
CREATE TABLE IF NOT EXISTS Polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PollOptions (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  FOREIGN KEY(poll_id) REFERENCES Polls(id) ON DELETE CASCADE
);

-- PollVotes (To prevent duplicate voting)
CREATE TABLE IF NOT EXISTS PollVotes (
  poll_id TEXT NOT NULL,
  matricule TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (poll_id, matricule),
  FOREIGN KEY(poll_id) REFERENCES Polls(id) ON DELETE CASCADE,
  FOREIGN KEY(matricule) REFERENCES Users(matricule) ON DELETE CASCADE
);

-- Lost & Found
CREATE TABLE IF NOT EXISTS LostAndFound (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'Lost' or 'Found'
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  image_url TEXT,
  reporter_id TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(reporter_id) REFERENCES Users(id) ON DELETE CASCADE
);
