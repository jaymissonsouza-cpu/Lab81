import "server-only";
import Database from "better-sqlite3";
import { storagePath } from "./storage";
import { seedDatabase } from "./seed";

/**
 * Banco SQLite local (VPS). Arquivo: $STORAGE_DIR/lab81.db
 * As migrações são aplicadas automaticamente e versionadas por PRAGMA user_version.
 * Para migrar para Postgres no futuro, substitua as funções em src/lib/repos/*.
 */

const MIGRATIONS: string[] = [
  /* 1 — estrutura inicial */ `
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE page_seo (
    path TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('project','product')),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    UNIQUE (type, slug)
  );

  CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    material TEXT NOT NULL DEFAULT '',
    application TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    challenge TEXT NOT NULL DEFAULT '',
    solution TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    featured INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    is_demo INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    materials TEXT NOT NULL DEFAULT '[]',
    colors TEXT NOT NULL DEFAULT '[]',
    sizes TEXT NOT NULL DEFAULT '[]',
    customizable INTEGER NOT NULL DEFAULT 0,
    availability TEXT NOT NULL DEFAULT 'sob_consulta',
    price_cents INTEGER,
    show_price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER,
    images TEXT NOT NULL DEFAULT '[]',
    published INTEGER NOT NULL DEFAULT 1,
    is_demo INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    cover_alt TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocol TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'novo',
    project_type TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    dimensions TEXT NOT NULL DEFAULT '',
    material TEXT NOT NULL DEFAULT '',
    colors TEXT NOT NULL DEFAULT '[]',
    quantity INTEGER NOT NULL DEFAULT 1,
    deadline TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    product_slug TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    contact_preference TEXT NOT NULL DEFAULT '',
    consent_at TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT '{}',
    internal_notes TEXT NOT NULL DEFAULT '',
    estimated_price_cents INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX quotes_status_idx ON quotes (status, created_at);

  CREATE TABLE quote_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('model','reference')),
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX quote_files_quote_idx ON quote_files (quote_id);

  CREATE TABLE quote_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'novo',
    consent_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,
];

declare global {
  var __lab81db: Database.Database | undefined;
}

function open() {
  const db = new Database(storagePath("lab81.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  const current = db.pragma("user_version", { simple: true }) as number;
  if (current < MIGRATIONS.length) {
    const migrate = db.transaction(() => {
      for (let v = current; v < MIGRATIONS.length; v++) db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${MIGRATIONS.length}`);
    });
    migrate();
  }

  seedDatabase(db);
  return db;
}

export function db() {
  if (!globalThis.__lab81db) globalThis.__lab81db = open();
  return globalThis.__lab81db;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
