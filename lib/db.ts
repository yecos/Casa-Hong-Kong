import 'server-only';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
let pool:Pool|undefined;
export function db() {
  if(!process.env.DATABASE_URL) throw new Error('Base de datos no configurada.');
  if(!pool) {pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:10000}); attachDatabasePool(pool);}
  return pool;
}
