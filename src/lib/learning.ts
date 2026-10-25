import type {Review} from '../types';
export function localDay(date=new Date()):string {const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
export function shiftDay(days:number,from=new Date()):string {const date=new Date(from.getFullYear(),from.getMonth(),from.getDate()+days);return localDay(date);}
export function calculateStreak(previous:string,current=localDay()):number {if(previous===current)return 0;const yesterday=shiftDay(-1);return previous===yesterday?1:-1;}
export function scheduleReview(prev:Review|undefined,quality:'again'|'good',today=localDay()):Review {
 if(quality==='again')return {due:today,interval:0,ease:Math.max(1.3,(prev?.ease??2.5)-0.2),repetitions:0,lastReviewed:today};
 const repetitions=(prev?.repetitions??0)+1;
 const interval=repetitions===1?1:repetitions===2?3:Math.max(4,Math.round((prev?.interval??3)*(prev?.ease??2.5)));
 const ease=Math.min(3.1,(prev?.ease??2.5)+0.05);
 const date=new Date(`${today}T12:00:00`);date.setDate(date.getDate()+interval);
 return {due:localDay(date),interval,ease,repetitions,lastReviewed:today};
}
export function videoFromUrl(raw:string):{embed:string;provider:'YouTube'|'Google Drive'}|null {
 try {
  const u=new URL(raw);if(u.protocol!=='https:')return null;
  if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be'].includes(u.hostname)){
   const id=u.hostname.includes('youtu.be')?u.pathname.split('/')[1]:u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:u.searchParams.get('v');
   if(id && /^[a-zA-Z0-9_-]{11}$/.test(id))return {embed:`https://www.youtube-nocookie.com/embed/${id}`,provider:'YouTube'};
  }
  if(u.hostname==='drive.google.com') {
   const id=u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? u.searchParams.get('id');
   if(id && /^[a-zA-Z0-9_-]{10,}$/.test(id))return {embed:`https://drive.google.com/file/d/${id}/preview`,provider:'Google Drive'};
  }
 }catch {return null;} return null;
}
