(function(root){
 'use strict';
 const version='feedback-v1',threshold=70;
 const textComplete=value=>typeof value==='string'&&(value.match(/[\p{L}\p{N}]/gu)||[]).length>=10;
 const rubric=[
  [
   [[/陽光|光能|日照|太陽/,'說明能量從陽光或光能而來。'],[/電能|發電|電力|電流/,'交代光能如何成為電能。'],[/轉換|供給|供應|驅動|帶動|運轉/,'說明能量轉換或供風扇運轉的過程。']],
   [[/光照|日照|陰影|角度|照射/,'寫出你要改變的光照或角度條件。'],[/功率|電流|電壓|輸出/,'指出預測改變的是哪一種輸出量。'],[/增加|減少|變大|變小|降低|提升|因為|由於/,'說明變化方向或推測理由。']],
   [[/改變|操縱|變因/,'明確寫出要改變的條件。'],[/固定|同一|保持|不變|控制/,'列出至少一項保持不變的條件。'],[/量測|測量|記錄|紀錄|比較/,'說明如何量測或記錄結果。']]
  ],
  [
   [[/\d+(?:\.\d+)?\s*mAh/i,'抄錄標示容量的數值與 mAh 單位。'],[/\d+(?:\.\d+)?\s*V\b/i,'抄錄容量對應的電壓與 V 單位。'],[/額定|輸出|未標示|未標明/,'補上額定容量或輸出規格；沒有標示時請註明。']],
   [[/\d+(?:\.\d+)?/,'代入你這顆行動電源的數值。'],[/Wh/i,'將換算結果以 Wh 表示。'],[/(?:×|\*|乘).*(?:÷|\/|除).*1000|1000.*(?:÷|\/|除)/,'寫出容量乘電壓再除以 1000 的換算過程。']],
   [[/\d.*(?:小時|分鐘|分鍾|hours?|mins?|\bh\b)/i,'提出可運轉時間的數值與時間單位。'],[/效率|功率|耗電|電能|Wh|\bW\b/i,'說明估計採用的電能、功率或效率。'],[/因為|假設|預估|推估|理由|若|如果|因此|所以/,'寫出預測所依據的假設或理由。']]
  ],
  [
   [[/操作|紀錄|記錄|計時|分工|安全觀察/,'記錄小組分工。'],[/檔位|低檔|中檔|高檔|低速|中速|高速/,'記錄固定的風扇檔位。'],[/護網|歸零|接線|串接/,'寫下接線、護網與歸零的檢查情形。']],
   [],
   [[/平均.*功率|功率.*平均/,'說明如何計算第 1～10 分鐘的平均功率。'],[/耗能|電能|Wh/i,'記錄 10 分鐘耗能與 Wh 單位。'],[/效率.*(?:時間|小時)|(?:時間|小時).*效率/,'用假設效率說明推估運轉時間。']]
  ],
  [
   [[/AI|人工智慧|未使用/i,'指出 AI 的說法；沒有使用時請交代查證對象。'],[/實測|手算|數據|證據|計算/,'提供自己的實測或手算證據。'],[/採用|修正|拒絕|不同意|核對|比較/,'說明採用、修正或拒絕的處理理由。']],
   [[/結果|摘要|功率|耗能|電能|時間/,'補上報告摘要或量測結果。'],[/AI|人工智慧|未使用/i,'揭露使用的 AI 工具或註明未使用 AI。'],[/自己|自行|親自|我們完成|我完成/,'交代哪些部分由自己完成。']],
   [[/教師|老師|完整放電/,'引用教師完整放電實測的資料。'],[/差異|誤差|相差|偏差|比較/,'指出你的推估與實測相差多少。'],[/原因|因為|發熱|轉速|電量|效率|負載/,'提出差異的可能原因。']]
  ],
  [
   [[/電池|行動電源|儲能/,'指出電池或行動電源的儲能角色。'],[/電能|化學能|能量/,'說明儲存與輸出的能量。'],[/充電|放電|供電|轉換/,'說明充電或放電過程。']],
   [],
   [[/功率|負載|電量|容量/,'指出你比較的功率或電量條件。'],[/時間|小時|運轉/,'比較可運轉時間。'],[/因為|所以|增加|減少|變短|變長|較短|較長|理由/,'解釋時間為何改變。']]
  ]
 ];
 function measurementsComplete(rows={}){
  if(!rows||typeof rows!=='object')return false;
  for(let m=0;m<=10;m++)for(const k of ['v','a','w','mah','wh']){const value=rows[m+'-'+k];if(value===undefined||value===null||String(value).trim()===''||!Number.isFinite(Number(value))||Number(value)<0||k==='v'&&Number(value)<=0)return false}
  return textComplete(rows['5-obs'])&&textComplete(rows['10-obs']);
 }
 function measurementReview(rows){
  const issues=[],strengths=[];let score=0;
  if(!measurementsComplete(rows))return {score:0,passed:false,issues:['請填妥 0～10 分鐘的 55 個數值欄位，V 須大於 0，其他值不得為負；第 5、10 分鐘觀察各至少 10 個字。'],strengths};
  score=40;strengths.push('11 筆數值與兩次觀察紀錄齊全。');
  const power=[];for(let m=0;m<=10;m++){const v=+rows[m+'-v'],a=+rows[m+'-a'],p=+rows[m+'-w'];if(Math.abs(p-v*a)>Math.max(.05,Math.abs(v*a)*.2))power.push(m)}
  if(power.length)issues.push('第 '+power.join('、')+' 分鐘的 W 與 V × A 差距偏大，請核對抄錄、單位與取樣時間。');else{score+=30;strengths.push('各筆功率與 V × A 大致一致。')}
  let monotonic=true;for(let m=1;m<=10;m++)for(const k of ['mah','wh'])if(+rows[m+'-'+k]+.001<+rows[(m-1)+'-'+k])monotonic=false;
  if(!monotonic)issues.push('累積 mAh 或 Wh 出現下降，請核對是否抄錯或中途歸零。');else{score+=15;strengths.push('累積量沒有不合理的倒退。')}
  const avg=Array.from({length:10},(_,i)=>+rows[(i+1)+'-w']).reduce((a,b)=>a+b,0)/10,energy=+rows['10-wh']-+rows['0-wh'],expected=avg/6;
  if(avg<=0||energy<=0)issues.push('平均功率或 10 分鐘耗能為 0，請確認風扇實際運轉及電力計量程。');else if(Math.abs(energy-expected)>Math.max(.03,expected*.35))issues.push('累積 Wh 的增量與平均 W × 10 ÷ 60 差距偏大，請核對時間、讀值與計量單位。');else{score+=15;strengths.push('10 分鐘耗能與平均功率換算大致一致。')}
  return {score,passed:score>=threshold&&issues.length===0,issues,strengths};
 }
 function textReview(i,j,lab){
  const raw=(lab.answers||{})[i+'-'+j],text=typeof raw==='string'?raw:'',issues=[],strengths=[];let score=0,blocking=false;
  if(textComplete(text)){score=25;strengths.push('已填寫足夠的基本說明。')}else issues.push('請至少寫 10 個中文字或英數字，並以自己的話具體說明。');
  for(const [pattern,advice] of rubric[i][j])if(pattern.test(text)){score+=25}else issues.push(advice);
  const compact=text.replace(/[\s\p{P}\p{S}]/gu,'');
  if(compact.length>=10&&new Set(compact).size<4){issues.push('內容有大量重複字元，請改成具體、可理解的回答。');blocking=true}
  for(let k=0;k<3;k++)if(k!==j&&compact.length>=10&&typeof (lab.answers||{})[i+'-'+k]==='string'&&compact===(lab.answers[i+'-'+k]).replace(/[\s\p{P}\p{S}]/gu,'')){issues.push('這題與另一題完全相同，請分別回答各題的重點。');blocking=true;break}
  if(/mAh\s*(?:就是|等於|=|＝)\s*Wh/i.test(text)){issues.push('mAh 是電量，Wh 是電能，兩者不能直接畫上等號，請補上對應電壓的換算。');blocking=true}
  const equation=text.match(/(\d+(?:\.\d+)?)\s*[×*]\s*(\d+(?:\.\d+)?)\s*[÷/]\s*1000\s*[=＝]\s*(\d+(?:\.\d+)?)\s*Wh/i);
  if(equation){const expected=+equation[1]*+equation[2]/1000;if(Math.abs(+equation[3]-expected)>Math.max(.02,expected*.03)){issues.push('換算算式的結果與前面數值不符，請重算「容量 × 電壓 ÷ 1000」。');blocking=true}}
  return {score,passed:textComplete(text)&&score>=threshold&&!blocking,issues,strengths};
 }
 function batteryModel(c){const capacity=+c.capacity,voltage=+c.voltage,charge=+c.charge,efficiency=+c.efficiency,power=+c.power;if(![capacity,voltage,charge,efficiency,power].every(Number.isFinite)||capacity<=0||voltage<=0||power<=0||charge<0||charge>100||efficiency<=0||efficiency>100)return null;const nominalWh=capacity*voltage/1000,usableWh=nominalWh*charge/100*efficiency/100;return {nominalWh,usableWh,hours:usableWh/power}}
 function batteryReview(trials){const valid=Array.isArray(trials)&&trials.length>=3&&trials.every(c=>c&&batteryModel(c));const unique=valid?new Set(trials.map(c=>[+c.capacity,+c.voltage,+c.charge,+c.efficiency,+c.power].join('|'))).size:0;const passed=valid&&unique>=3;return {score:passed?100:valid?50:0,passed,issues:passed?[]:['請操作電池模擬器，改變功率或電量等條件，記錄至少三個不同情境。'],strengths:passed?['已完成三個不同情境的互動探索。']:[]}}
 function review(i,lab={}){const tasks=Array.from({length:3},(_,j)=>i===2&&j===1?measurementReview(lab.rows):i===4&&j===1?batteryReview(lab.batteryTrials):textReview(i,j,lab));return {version,threshold,score:Math.round(tasks.reduce((a,t)=>a+t.score,0)/3),passed:tasks.every(t=>t.passed),tasks}}
 function fingerprint(i,lab={}){const raw=JSON.stringify({version,answers:Array.from({length:3},(_,j)=>(lab.answers||{})[i+'-'+j]||''),rows:i===2?Array.from({length:11},(_,m)=>['v','a','w','mah','wh','obs'].map(k=>(lab.rows||{})[m+'-'+k]||'')):null,...(i===4?{batteryTrials:lab.batteryTrials||[]}:{})});let h=2166136261;for(let k=0;k<raw.length;k++)h=Math.imul(h^raw.charCodeAt(k),16777619);return (h>>>0).toString(16)}
 function progress(lab={}){
  const tasks=Array.from({length:5},()=>[false,false,false]),unlocked=[true,false,false,false,true],reports=[];
  for(let i=0;i<5;i++){if(i>0&&i<4)unlocked[i]=unlocked[i-1]&&tasks[i-1].every(Boolean);const report=review(i,lab);reports.push(report);const submission=(lab.submissions||{})[i];if(unlocked[i]&&submission&&submission.version===version&&submission.fingerprint===fingerprint(i,lab))tasks[i]=report.tasks.map(t=>t.passed)}
  return {tasks,unlocked,counts:tasks.map(a=>a.filter(Boolean).length),reports};
 }
 root.SolarProgress={version,threshold,textComplete,measurementsComplete,batteryModel,review,fingerprint,progress};
})(typeof window==='undefined'?globalThis:window);
