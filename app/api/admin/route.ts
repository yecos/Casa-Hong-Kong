import { z } from 'zod';
import { adminUser } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { getCatalog } from '../../../lib/catalog';
import { sameOrigin,jsonBody,privateHeaders } from '../../../lib/http';
import { dishSchema,rulesSchema,statuses,allowedTransitions,type OrderStatus } from '../../../lib/order-domain';
export const runtime='nodejs';
export async function GET() {
 try {
 const user=await adminUser();if(!user)return Response.json({error:'Acceso restringido.'},{status:401,headers:privateHeaders});
 const state=await getCatalog();
 const {rows:orders}=await db().query('SELECT id,reference,status,details,total,created_at,updated_at,is_test FROM hk_orders ORDER BY created_at DESC LIMIT 100');
 return Response.json({...state,orders,email:user.email},{headers:privateHeaders});
 }catch{return Response.json({error:'No pudimos abrir el panel.'},{status:503,headers:privateHeaders});}
}
const mutation=z.discriminatedUnion('action',[
 z.object({action:z.literal('dish'),version:z.number().int().positive(),dish:dishSchema}),
 z.object({action:z.literal('rules'),version:z.number().int().positive(),rules:rulesSchema}),
 z.object({action:z.literal('status'),id:z.uuid(),previous:z.enum(statuses),next:z.enum(statuses)}),
]);
export async function PATCH(request:Request) {
 let client;
 try {
 sameOrigin(request);const user=await adminUser();if(!user)return Response.json({error:'Acceso restringido.'},{status:401,headers:privateHeaders});
 const input=mutation.parse(await jsonBody(request));client=await db().connect();await client.query('BEGIN');
 if(input.action==='status') {
  const {rows}=await client.query("SELECT status,details->>'method' AS method FROM hk_orders WHERE id=$1 FOR UPDATE",[input.id]);
  const order=rows[0];if(!order || order.status!==input.previous) throw new Error('El pedido cambió. Actualiza el panel.');
  if(!allowedTransitions(order.status as OrderStatus,order.method).includes(input.next))throw new Error('Cambio de estado no permitido.');
  await client.query('UPDATE hk_orders SET status=$1,updated_at=now() WHERE id=$2',[input.next,input.id]);
  await client.query('INSERT INTO hk_order_events(order_id,status,actor) VALUES($1,$2,$3)',[input.id,input.next,user.email]);
 }else {
  const {rows}=await client.query('SELECT catalog,version FROM hk_config WHERE id=1 FOR UPDATE');
  if(!rows[0] || rows[0].version!==input.version)throw new Error('La carta cambió. Actualiza el panel.');
  if(input.action==='dish') {
   const catalog=rows[0].catalog as {id:string}[];const index=catalog.findIndex(d=>d.id===input.dish.id);
   const dish={...input.dish,price:input.dish.variants?Math.min(...Object.values(input.dish.variants)):input.dish.price};
   if(index<0) {if(catalog.length>=100)throw new Error('La carta alcanzó el límite.');catalog.push(dish);}else catalog[index]=dish;
   await client.query('UPDATE hk_config SET catalog=$1,version=version+1,updated_at=now() WHERE id=1',[JSON.stringify(catalog)]);
  }else await client.query('UPDATE hk_config SET rules=$1,version=version+1,updated_at=now() WHERE id=1',[input.rules]);
  await client.query('INSERT INTO hk_admin_audit(actor,action) VALUES($1,$2)',[user.email,input.action==='dish'?`plato:${input.dish.id}`:'reglas']);
 }
 await client.query('COMMIT');return Response.json({ok:true},{headers:privateHeaders});
 }catch(e){if(client)await client.query('ROLLBACK');const message=e instanceof z.ZodError?'Revisa los valores del formulario.':e instanceof Error?e.message:'';const safe=/cambió|no permitido|alcanzó|Origen/.test(message);return Response.json({error:safe?message:'No se pudieron guardar los cambios.'},{status:safe?409:400,headers:privateHeaders});}finally{client?.release();}
}
