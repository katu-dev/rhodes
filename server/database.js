
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './rhodes.db',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await openDb();

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create GameState Table (linked to user)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS gamestate (
      user_id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Migration: Add ELO column if not exists
  try {
    await db.exec('ALTER TABLE users ADD COLUMN elo INTEGER DEFAULT 1000;');
  } catch (e) {
    // Column likely exists, ignore
  }

  // Create PVP Teams Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pvp_teams (
      user_id INTEGER,
      type TEXT, -- 'ATTACK' or 'DEFENSE'
      squad_json TEXT,
      power INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, type),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  console.log('Database initialized.');
  return db;
}
