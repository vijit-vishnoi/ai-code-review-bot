import Database from 'better-sqlite3';
import path from 'path';

// Define the absolute path for the SQLite database file
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new Database(dbPath, { verbose: console.log });

// Initialize the single sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    review_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export interface SessionRecord {
  id: string;
  code: string;
  language: string;
  review_json: string | null;
  created_at: string;
}

// Prepare statements
const insertSessionStmt = db.prepare(`
  INSERT INTO sessions (id, code, language)
  VALUES (@id, @code, @language)
`);

const updateSessionReviewStmt = db.prepare(`
  UPDATE sessions
  SET review_json = @review_json
  WHERE id = @id
`);

const getAllSessionsStmt = db.prepare(`
  SELECT * FROM sessions ORDER BY created_at DESC
`);

const getSessionByIdStmt = db.prepare(`
  SELECT * FROM sessions WHERE id = ?
`);

export const dbHelpers = {
  createSession: (id: string, code: string, language: string) => {
    insertSessionStmt.run({ id, code, language });
  },
  saveReview: (id: string, reviewJson: string) => {
    updateSessionReviewStmt.run({ id, review_json: reviewJson });
  },
  getAllSessions: (): SessionRecord[] => {
    return getAllSessionsStmt.all() as SessionRecord[];
  },
  getSessionById: (id: string): SessionRecord | undefined => {
    return getSessionByIdStmt.get(id) as SessionRecord | undefined;
  }
};

export default db;
