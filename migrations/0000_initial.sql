-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  matricule TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  department TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Sessions table for secure HTTP-only session management
CREATE TABLE IF NOT EXISTS Sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create Staff Codes table
CREATE TABLE IF NOT EXISTS StaffCodes (
  code TEXT PRIMARY KEY,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
