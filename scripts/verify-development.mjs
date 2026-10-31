import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import pg from 'pg';
assert.equal(new URL(process.env.DATABASE_URL).hostname,'ep-polished-heart-b7bl9v3c-pooler.c-13.us-east-1.aws.neon.tech','Integration checks must use the isolated development branch.');
const base='http://localhost:3006';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1});
const snapshot=(await pool.query('SELECT catalog,rules FROM hk_config WHERE id=1')).rows[0];
const checks=[];
const record=(name)=>{checks.push(name);console.log('PASS',name);};
const payload={idempotencyKey:randomUUID(),branch:'casa',method:'domicilio',cart:[{id:'especial:Mini',quantity:1}],customer:{name:'PRUEBA TÉCNICA - NO PREPARAR',phone:'3000000000',address:'Dirección ficticia de prueba 123',neighborhood:'Calasanz'},notes:'Solicitud sintética de desarrollo. No enviar mensajes.',consent:true,expectedTotal:31000};
async function post(body){return fetch(base+'/api/solicitudes',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(body)});}
try {
 assert.equal((await fetch(base+'/api/admin')).status,401);record('private admin API denies unauthenticated access');
 assert.equal((await fetch(base+'/api/admin',{method:'PATCH',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({action:'rules'})})).status,401);record('private mutations require admin session');
 const proxy=await fetch(base+'/api/auth/email-otp/send-verification-otp',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({email:'not-authorized@example.invalid',type:'sign-in'})});assert.equal(proxy.status,403);record('login proxy rejects unauthorized email without sending a code');
 const catalog=await (await fetch(base+'/api/catalogo')).json();assert.equal(catalog.ready,true);assert.equal(catalog.catalog.length,25);record('public catalog loads from development Postgres');
 assert.equal((await post({...payload,consent:false})).status,400);record('registration requires explicit consent');
 assert.equal((await post({...payload,expectedTotal:1})).status,400);record('server rejects manipulated total');
 const first=await post(payload);const body=await first.json();assert.equal(first.status,201,JSON.stringify(body));assert.match(body.reference,/^HK-/);assert.equal(new URL(body.whatsappUrl).hostname,'wa.me');record('request saved with reference and prepared WhatsApp URL');
 const second=await post(payload);assert.equal(second.status,201);assert.equal((await second.json()).id,body.id);assert.equal(Number((await pool.query('SELECT count(*) AS n FROM hk_orders WHERE idempotency_key=$1',[payload.idempotencyKey])).rows[0].n),1);record('retry is idempotent and does not duplicate requests');
 await pool.query('UPDATE hk_orders SET is_test=true WHERE id=$1',[body.id]);
 assert.equal((await fetch(base+`/api/solicitudes?id=${body.id}&token=${'a'.repeat(64)}`)).status,404);record('tracking rejects invalid secret');
 const tracking=await (await fetch(base+`/api/solicitudes?id=${body.id}&token=${body.token}`)).json();assert.equal(tracking.status,'pendiente');assert.equal(tracking.total,31000);assert.equal('customer' in tracking,false);assert.equal('details' in tracking,false);record('private tracking reports status without customer data');
 await pool.query("UPDATE hk_config SET rules=jsonb_set(rules,'{acceptingRequests}','false') WHERE id=1");
 assert.equal((await post({...payload,idempotencyKey:randomUUID()})).status,400);record('paused requests are rejected by the server');
 await pool.query('UPDATE hk_config SET rules=$1 WHERE id=1',[snapshot.rules]);
 const sold=snapshot.catalog.map(d=>({...d,available:false}));await pool.query('UPDATE hk_config SET catalog=$1 WHERE id=1',[JSON.stringify(sold)]);
 assert.equal((await post({...payload,idempotencyKey:randomUUID()})).status,400);record('sold-out products rejected even if the client is stale');
 writeFileSync('../../work/admin-development-check.json',JSON.stringify({project:'aged-wind-17221122',branch:'br-floral-fog-b7rg5bpc',passed:checks,checkedAt:new Date().toISOString()},null,2));
 console.log(`${checks.length} integration checks passed on isolated development branch. No WhatsApp messages or emails sent.`);
}finally {await pool.query('UPDATE hk_config SET catalog=$1,rules=$2 WHERE id=1',[JSON.stringify(snapshot.catalog),snapshot.rules]);await pool.end();}
