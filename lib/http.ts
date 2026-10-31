import 'server-only';
export function sameOrigin(request:Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin) throw new Error('Origen no permitido.');
}
export async function jsonBody(request:Request) {
  if(!request.headers.get('content-type')?.includes('application/json')) throw new Error('Se requiere JSON.');
  const text=await request.text();
  if(text.length>25000) throw new Error('Solicitud demasiado grande.');
  return JSON.parse(text);
}
export const privateHeaders = {'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'};
