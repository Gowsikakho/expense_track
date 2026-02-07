import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

<<<<<<< HEAD
// Fallback database URL for development
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://expensetracker_owner:wrvpaM5eK4kS@ep-aged-hall-a5dt5a0b.us-east-2.aws.neon.tech/expensetracker?sslmode=require';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not defined');
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, {schema});
=======
// Note: Using direct connection for Neon serverless HTTP driver
// This driver is designed for client-side/edge usage where server env vars aren't available
const sql = neon('postgresql://expensetracker_owner:wrvpaM5eK4kS@ep-aged-hall-a5dt5a0b.us-east-2.aws.neon.tech/expensetracker?sslmode=require');
export const db = drizzle(sql, { schema });
>>>>>>> c268406 (fixed database and hydration errors)
