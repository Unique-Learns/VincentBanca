import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL;

// Use connection string from environment variables
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

export const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });