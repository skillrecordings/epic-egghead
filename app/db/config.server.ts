import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

if (!process.env.DATABASE_PATH) {
	throw new Error('Missing environment variable: DATABASE_PATH')
}

export const db = drizzle(new Database(process.env.DATABASE_PATH))

// Automatically run migrations on startup
void migrate(db, {
	migrationsFolder: 'app/db/migrations',
})
