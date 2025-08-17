import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env file");
}

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });

export const db = drizzle(client, { schema });

// If you also want Supabase auth/storage later:
export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);
