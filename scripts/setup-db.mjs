import { readFileSync } from 'node:fs';
import pg from 'pg';
import { seedDishes } from '../app/menu.ts';
import { deliveryRules } from '../app/order-config.ts';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1});
try {
 await pool.query(readFileSync(new URL('../db/schema.sql',import.meta.url),'utf8'));
 await pool.query('INSERT INTO hk_config(id,catalog,rules) VALUES(1,$1,$2) ON CONFLICT(id) DO NOTHING',[JSON.stringify(seedDishes.map(d=>({...d,available:true}))),{...deliveryRules,acceptingRequests:true,pauseMessage:'Por ahora no recibimos nuevas solicitudes. Consulta directamente con la sede.'}]);
 console.log('Esquema y carta inicial preparados.');
} finally {await pool.end();}
