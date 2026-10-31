import { z } from 'zod';
import { registerRequest, validTrackingToken } from '../../../lib/requests';
import { sameOrigin,jsonBody,privateHeaders } from '../../../lib/http';
import { db } from '../../../lib/db';
import { OrderError } from '../../../lib/order-domain';
export const runtime='nodejs';
export async function POST(request:Request) {
 try {sameOrigin(request);const body=await jsonBody(request);const ip=(request.headers.get('x-forwarded-for')||'local').split(',')[0].trim();const result=await registerRequest(body,ip);return Response.json(result,{status:201,headers:privateHeaders});}
 catch(e) {const validation=e instanceof z.ZodError;const message=validation?'Revisa los datos de tu solicitud.':e instanceof Error?e.message:'';const safe=e instanceof OrderError || /^Las solicitudes|^No se alcanza|^Un plato|^Los precios|^La selección|^Carta no|^Demasiadas|^Máximo|^Origen|^Se requiere|^Solicitud demasiado/.test(message);return Response.json({error:validation||safe?message:'No pudimos registrar la solicitud. Intenta nuevamente.'},{status:message.startsWith('Demasiadas')?429:validation||safe?400:503,headers:privateHeaders});}
}
export async function GET(request:Request) {
 if(!process.env.ORDER_TOKEN_SECRET)return Response.json({error:'Seguimiento no disponible.'},{status:503,headers:privateHeaders});
 const url=new URL(request.url);const id=url.searchParams.get('id')||'';const token=url.searchParams.get('token')||'';
 if(!z.uuid().safeParse(id).success || !validTrackingToken(id,token)) return Response.json({error:'Enlace inválido.'},{status:404,headers:privateHeaders});
 try {
 const {rows}=await db().query("SELECT reference,status,total,created_at,updated_at,details->>'method' AS method FROM hk_orders WHERE id=$1",[id]);
 if(!rows[0])return Response.json({error:'Solicitud no encontrada.'},{status:404,headers:privateHeaders});
 return Response.json(rows[0],{headers:privateHeaders});
 }catch{return Response.json({error:'No pudimos consultar el estado.'},{status:503,headers:privateHeaders});}
}
