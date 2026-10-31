import { getAuth,authConfigured } from '../../../../lib/auth';
async function handler(request:Request,context:unknown) {
 if(!authConfigured()) return Response.json({error:'Acceso administrativo pendiente de configurar.'},{status:503});
 const path=new URL(request.url).pathname.replace('/api/auth/','');
 const allowed=['get-session','sign-out','email-otp/send-verification-otp','sign-in/email-otp'];
 if(!allowed.includes(path)) return Response.json({error:'Ruta no habilitada.'},{status:403});
 if(request.method==='POST' && path!=='sign-out') {
   try {const body=await request.clone().json();const emails=(process.env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase());if(!emails.includes(String(body.email||'').trim().toLowerCase())) return Response.json({error:'Correo no autorizado.'},{status:403});}catch{return Response.json({error:'Solicitud inválida.'},{status:400});}
 }
 const handlers=getAuth().handler();
 const method=request.method as keyof typeof handlers;
 if(!handlers[method]) return new Response(null,{status:405});
 return (handlers[method] as (r:Request,c:unknown)=>Promise<Response>)(request,context);
}
export {handler as GET,handler as POST,handler as PUT,handler as PATCH,handler as DELETE};
