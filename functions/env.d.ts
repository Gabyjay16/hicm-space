export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  THESIS_QUEUE: Queue;
  GROQ_API_KEY: string;
  SESSION_SECRET: string;
}
