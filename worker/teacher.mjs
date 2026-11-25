async function resetVersion(env){const row=await env.DB.prepare("SELECT value FROM classroom_meta WHERE key = 'reset_version'").first();return Number(row?.value||0)}
async function teacherSession(request,env){const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');if(token.length!==72)return null;return env.DB.prepare('SELECT token_hash FROM teacher_sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(token),Date.now()).first()}
async function teacherRoute(request,env){
 const path=new URL(request.url).pathname;let body={};
 if(request.method==='POST'){
  if(!allowedOrigin(request))return json({error:'請從教學島網站操作。'},403);
  const raw=await request.text();if(raw.length>2000)return json({error:'資料過長。'},413);try{body=JSON.parse(raw)}catch{return json({error:'資料格式錯誤。'},400)}
 }
 if(path==='/api/teacher/login'&&request.method==='POST'){
  if(!env.TEACHER_PASSWORD)return json({error:'教師登入尚未設定，請通知管理者。'},503);
  const key=await hash(request.headers.get('CF-Connecting-IP')||'local-classroom'),now=Date.now(),attempt=await env.DB.prepare('SELECT failures, window_start FROM teacher_login_attempts WHERE attempt_key = ?').bind(key).first();
  if(attempt&&now-attempt.window_start<900000&&attempt.failures>=5)return json({error:'密碼錯誤次數過多，請於 15 分鐘後再試。'},429);
  const supplied=typeof body.password==='string'?body.password:'',a=await hash(supplied),b=await hash(env.TEACHER_PASSWORD);let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);
  if(mismatch){await env.DB.prepare('INSERT INTO teacher_login_attempts (attempt_key, failures, window_start) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET failures = CASE WHEN ? - window_start >= 900000 THEN 1 ELSE failures + 1 END, window_start = CASE WHEN ? - window_start >= 900000 THEN ? ELSE window_start END').bind(key,now,now,now,now).run();return json({error:'教師密碼不正確。'},401)}
  await env.DB.prepare('DELETE FROM teacher_login_attempts WHERE attempt_key = ?').bind(key).run();const token=crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('INSERT INTO teacher_sessions (token_hash, expires_at) VALUES (?, ?)').bind(await hash(token),Date.now()+3600000).run();return json({token,expiresIn:3600,resetVersion:await resetVersion(env)});
 }
 const session=await teacherSession(request,env);if(!session)return json({error:'請先登入教師管理。'},401);
 if(path==='/api/teacher/status'&&request.method==='GET'){
  const data=await summary(env),nonce=crypto.randomUUID();await env.DB.prepare('UPDATE teacher_sessions SET reset_nonce_hash = ? WHERE token_hash = ?').bind(await hash(nonce),session.token_hash).run();
  return json({resetVersion:data.resetVersion,resetNonce:nonce,totalStudents:ROSTER.length,counts:data.islands.map(a=>a.length),totalCompletions:data.islands.reduce((a,r)=>a+r.length,0)});
 }
 if(path==='/api/teacher/reset'&&request.method==='POST'){
  if(body.confirmation!=='清除所有學習資料')return json({error:'請勾選確認清除範圍後再操作。'},400);
  if(body.resetVersion!==await resetVersion(env)||typeof body.resetNonce!=='string')return json({error:'資料版本已變更，請重新讀取管理頁面。'},409);
  const claim=await env.DB.prepare('UPDATE teacher_sessions SET reset_nonce_hash = NULL WHERE token_hash = ? AND reset_nonce_hash = ?').bind(session.token_hash,await hash(body.resetNonce)).run();
  if(Number(claim.meta?.changes??claim.changes)!==1)return json({error:'清除確認已使用或到期，請重新讀取管理頁面。'},409);
  await env.DB.batch([
   env.DB.prepare("INSERT INTO classroom_meta (key, value) VALUES ('reset_version', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1"),
   env.DB.prepare('DELETE FROM completions'),env.DB.prepare('DELETE FROM battery_completions'),env.DB.prepare('DELETE FROM screenshots'),env.DB.prepare('DELETE FROM screenshot_completions'),env.DB.prepare('DELETE FROM sessions'),env.DB.prepare('DELETE FROM teacher_sessions'),env.DB.prepare('DELETE FROM teacher_login_attempts')
  ]);
  await clearScreenshotObjects(env,body.resetVersion);
  return json({ok:true,resetVersion:await resetVersion(env),message:'已清除全班學習資料。所有裝置下次連線會重設作答、評分與登入狀態。'});
 }
 if(path==='/api/teacher/logout'&&request.method==='POST'){await env.DB.prepare('DELETE FROM teacher_sessions WHERE token_hash = ?').bind(session.token_hash).run();return json({ok:true})}
 return json({error:'找不到教師功能。'},404);
}
