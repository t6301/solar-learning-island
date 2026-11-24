const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const hash=async token=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(b=>b.toString(16).padStart(2,'0')).join('');
async function summary(env){const result=await env.DB.prepare('SELECT student_id, island FROM completions ORDER BY completed_at, student_id').all();const islands=Array.from({length:4},()=>[]);for(const row of result.results||[]){const student=ROSTER.find(s=>s.id===row.student_id);if(student&&islands[row.island])islands[row.island].push({id:student.id,seat:student.seat,name:student.name,group:student.group})}return {islands,totalStudents:ROSTER.length}}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(path==='/api/roster'&&request.method==='GET')return json({students:ROSTER});
  if(path==='/api/islands'&&request.method==='GET')return json(await summary(env));
  if(path.startsWith('/api/')&&request.method==='POST'){
   if(request.headers.get('Origin')!==url.origin)return json({error:'請從本站登入與送出紀錄。'},403);
   if(Number(request.headers.get('Content-Length')||0)>65000)return json({error:'資料超過大小限制。'},413);
   const raw=await request.text();if(raw.length>65000)return json({error:'資料超過大小限制。'},413);let payload;try{payload=JSON.parse(raw)}catch{return json({error:'資料格式錯誤。'},400)}
   if(path==='/api/login'){
    const student=ROSTER.find(s=>s.id===String(payload.studentId));if(!student)return json({error:'請選擇名單中的學生。'},400);
    const token=crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('INSERT INTO sessions (token_hash, student_id, expires_at) VALUES (?, ?, ?)').bind(await hash(token),student.id,Date.now()+7*86400000).run();
    return json({student,token,...await summary(env)});
   }
   if(path==='/api/progress'){
    const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');if(token.length!==72)return json({error:'請重新選擇名單登入。'},401);
    const session=await env.DB.prepare('SELECT student_id FROM sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(token),Date.now()).first();if(!session)return json({error:'登入已到期，請重新登入。'},401);
    const lab=payload.lab;if(!lab||typeof lab!=='object'||Array.isArray(lab))return json({error:'缺少學習紀錄。'},400);
    const state=globalThis.SolarProgress.progress(lab);const statements=[];
    for(let i=0;i<4;i++)if(state.counts[i]===3)statements.push(env.DB.prepare('INSERT INTO completions (student_id, island, completed_at) VALUES (?, ?, ?) ON CONFLICT(student_id, island) DO NOTHING').bind(session.student_id,i,Date.now()));
    if(statements.length)await env.DB.batch(statements);return json({...await summary(env),counts:state.counts});
   }
   if(path==='/api/logout'){const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hash(token)).run();return json({ok:true})}
  }
  if(path.startsWith('/api/'))return json({error:'找不到此服務。'},404);
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
  const asset=ASSETS[path==='/'?'/index.html':path];if(!asset)return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"}});
 }catch(error){return json({error:'名單服務暫時無法使用，請稍後再試。'},503)}
}};
