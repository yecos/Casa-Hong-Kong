'use client';
import { useState } from 'react';
import { createAuthClient } from '@neondatabase/auth/next';
const client=createAuthClient();
export default function AdminLogin() {
 const [email,setEmail]=useState('');const [otp,setOtp]=useState('');const [sent,setSent]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
 async function submit(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault();setBusy(true);setError('');setMessage('');
  try {
   if(!sent) {const result=await client.emailOtp.sendVerificationOtp({email:email.trim().toLowerCase(),type:'sign-in'});if(result.error) throw new Error('No pudimos enviar el código. Verifica el correo autorizado e intenta nuevamente.');setSent(true);setMessage('Revisa tu correo e ingresa el código recibido.');}
   else {const result=await client.signIn.emailOtp({email:email.trim().toLowerCase(),otp});if(result.error)throw new Error('Código incorrecto o vencido. Intenta nuevamente.');window.location.assign('/admin');}
  }catch(e){setError(e instanceof Error?e.message:'No se pudo iniciar sesión.');}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="admin-login"><p>Solo las cuentas autorizadas pueden administrar los restaurantes. Ingresa tu correo para recibir un código; no necesitas crear una contraseña.</p><label>Correo autorizado<input type="email" required autoComplete="email" value={email} disabled={sent||busy} onChange={e=>setEmail(e.target.value)}/></label>{sent&&<label>Código de acceso<input required inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={8} value={otp} onChange={e=>setOtp(e.target.value)}/></label>}<button className="button" disabled={busy}>{busy?'Procesando…':sent?'Entrar al panel':'Recibir código por correo'}</button>{sent&&<button className="edit-order" type="button" disabled={busy} onClick={()=>{setSent(false);setOtp('');setMessage('');setError('');}}>Cambiar correo o solicitar otro código</button>}<p role="status">{message}</p><p className="form-error" role="alert">{error}</p><button type="button" className="edit-order" onClick={async()=>{await client.signOut();setMessage('Sesión anterior cerrada. Puedes ingresar nuevamente.');}}>Cerrar sesión anterior</button></form>;
}
