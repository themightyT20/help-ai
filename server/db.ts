import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });