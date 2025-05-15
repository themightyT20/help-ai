import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're in a serverless environment (like Cloudflare Pages Functions)
const isServerless = process.env.CF_PAGES === 'true' || process.env.NODE_ENV === 'cloudflare';

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzleNeon>;

if (isServerless) {
  // Serverless connection for Cloudflare Pages
  // Use any to bypass TypeScript version issues with neonConfig
  (neonConfig as any).fetchOptions = {
    // Used for network timeouts in serverless environments
    cache: 'no-store',
  };
  
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleNeon(sql, { schema });
} else {
  // Traditional connection pool for Node.js environments
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
    ssl: {
      rejectUnauthorized: false // Required for Supabase/Neon connections
    }
  });

  // Add error handling for the pool
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
  });

  db = drizzle(pool, { schema });
}

export { db };