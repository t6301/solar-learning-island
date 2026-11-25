'use strict';
// 作答須經學生送出，並通過共用初步規準，才能計入完成進度。
const gateState=()=>SolarProgress.progress(readLab());
count=function(i){return gateState().counts[i]||0};
const originalRender=render;
render=function(){originalRender();const state=gateState();$$('#cards .course').forEach(b=>{const i=Number(b.dataset.island);if(i<0)return;const locked=!state.unlocked[i];b.classList.toggle('locked',locked);b.setAttribute('aria-disabled',String(locked));b.querySelector('.status').textContent=locked?'尚未解鎖':count(i)===data[i].tasks.length?'已完成':count(i)?'填寫中':'可開始';if(locked)b.setAttribute('aria-label',data[i].name+'，請先完成上一關')});const start=$('#detail .primary');if(start&&!state.unlocked[selected]){start.disabled=true;start.textContent='請先完成上一關'}};
const taskPrompts=[
 ['請用自己的話說明陽光如何轉成電能，以及電能如何供風扇使用。','請預測光照或板面角度改變時，輸出電功率會如何變化，並說明理由。','請寫出操縱變因、保持不變的條件，以及你要量測的項目。'],
 ['請抄錄行動電源的標示容量、對應電壓、額定容量及 USB 輸出規格。','請寫出 mAh 換算 Wh 的算式、代入數值、結果與單位。','請先預測風扇能運轉多久，並寫出你的假設與理由。'],
 ['請記錄組員分工、固定的風扇檔位，以及接線、護網與電力計歸零的檢查結果。',null,'請寫出第 1～10 分鐘平均功率、10 分鐘耗能、假設效率、推估運轉時間的算式與結果，並用自己的話說明。'],
 ['請列出一項 AI 說法、你的實測或手算證據，以及採用、修正或拒絕的理由。','請填寫報告摘要、AI 工具與日期、AI 協助內容及自己完成的部分；若未使用 AI，請說明自己的查證方法。','請填寫教師完整放電實測結果、與自己推估的差異及原因；尚未取得數據時，請先向教師確認。']
];
taskPrompts.push(window.BATTERY_PROMPTS);
openLesson=function(i){
 const state=gateState();if(!state.unlocked[i]){selected=state.unlocked.findLastIndex(Boolean);render();toast('請先填寫完成上一關的必填內容');return}
 selected=i;render();const body=$('#lessonBody'),d=data[i];body.replaceChildren();body.append(el('div','第 '+(i+1)+' 關 · '+d.tag,'tags'),el('h2',d.name),el('p','填好後請按「送出作答，取得建議」。每題初步檢核至少 70 分且無明顯資料問題，才會自動打勾並解鎖下一關。正式成績與答案正確性由教師判定。'));
 d.tasks.forEach((t,j)=>{const label=el('div',undefined,'task'),input=el('input');input.type='checkbox';input.disabled=true;input.dataset.task=j;input.checked=state.tasks[i][j];input.setAttribute('aria-label',t+'（系統自動判定）');const tx=el('span');tx.append(el('strong',t),el('small','等待填寫完成'));label.append(input,tx);body.append(label)});
 window.enrichSolarLesson(i,body);
 const form=el('section',undefined,'required-answers');form.append(el('h3','本關必填作答'),el('p','每題至少填寫 10 個中文字或英數字，空白與標點不計。內容即時儲存在此瀏覽器。'));
 d.tasks.forEach((task,j)=>{
  if(i===4&&j===1){form.append(el('p','請在上方模擬器記錄三個不同情境。'));return}
  if(i===2&&j===1){form.append(el('p','量測任務：請填妥上方 0～10 分鐘全部 55 個數值欄位（V 必須大於 0，其餘可為 0），並在第 5、10 分鐘的「觀察」各寫至少 10 個字，說明溫度與聲音等現象。','measurement-requirement'));return}
  const label=el('label',undefined,'answer-label');label.append(el('strong',task),el('span',taskPrompts[i][j]));const text=el('textarea');text.rows=3;text.required=true;text.dataset.answer=i+'-'+j;text.setAttribute('aria-label',task+'必填作答');text.placeholder='至少 10 個中文字或英數字';text.value=(readLab().answers||{})[i+'-'+j]||'';const status=el('small',undefined,'answer-status');text.oninput=()=>{const lab=readLab();lab.answers=lab.answers||{};lab.answers[i+'-'+j]=text.value;writeLab(lab)};label.append(text,status);form.append(label);
 });body.append(form);
 const criteria=el('details',undefined,'review-criteria');criteria.append(el('summary','初步評分規準與使用限制'),el('p','文字題：基本說明 25 分，三項主題重點各 25 分；每題至少 70 分。大量重複字元、整題照貼另一題、明顯的單位或算式問題，都須先修正。量測題檢查完整性、V×A、累積量及耗能一致性。'),el('p','這是規準式自動檢核，並非 AI 教師。分數不是正式成績；可能無法辨識所有同義表達，也不能驗證數據真實性。有疑問請與教師確認。'));body.append(criteria);
 const feedback=el('section',undefined,'review-feedback');feedback.id='reviewFeedback';feedback.setAttribute('aria-live','polite');body.append(feedback);
 const bar=el('div',undefined,'gate-footer'),message=el('p',undefined,'gate-message'),actions=el('div',undefined,'review-actions'),submit=el('button','送出作答，取得建議','primary'),next=el('button',undefined,'primary');submit.id='submitAnswers';submit.onclick=()=>submitLesson(i);next.id='nextStage';next.onclick=()=>{if(count(i)!==3)return;if(i<data.length-1){openLesson(i+1);$('#lesson').scrollTop=0}else{$('#lesson').close();toast('本關已完成，可查看各島成就。');view='progress';$$('.nav').find(b=>b.dataset.view==='progress').click()}};actions.append(submit,next);bar.append(message,actions);body.append(bar);updateLessonGate(i);if(!$('#lesson').open)$('#lesson').showModal();$('#lesson').scrollTop=0;
};
function updateLessonGate(i){
 const lab=readLab(),state=gateState(),body=$('#lessonBody');
 body.querySelectorAll('input[data-task]').forEach(input=>{const j=+input.dataset.task;input.checked=state.tasks[i][j];input.parentElement.querySelector('small').textContent=input.checked?'已送出並通過初步檢核':'待送出作答或修正建議'});
 body.querySelectorAll('textarea[data-answer]').forEach(text=>{const valid=SolarProgress.textComplete(text.value);text.parentElement.querySelector('.answer-status').textContent=valid?((lab.submissions||{})[i]?.fingerprint===SolarProgress.fingerprint(i,lab)?'已送出，請查看下方初步評分與建議':'草稿已儲存，請送出取得檢核建議'):'至少需要 10 個中文字或英數字';text.setAttribute('aria-invalid',String(!valid))});
 const complete=state.counts[i]===3,button=$('#nextStage');button.disabled=!complete;button.textContent=i<data.length-1?'前往下一關：'+data[i+1].name:'完成旅程，查看成就';body.querySelector('.gate-message').textContent=complete?(i<data.length-1?'本關已通過初步檢核，下一關已解鎖。':'本關已送出並通過初步檢核，可查看成就或繼續其他島嶼。'):'請送出作答；若有缺漏或問題，依建議修正後再送出。';
 const box=$('#reviewFeedback');box.replaceChildren();const saved=(lab.feedback||{})[i];if(saved){const stale=saved.fingerprint!==SolarProgress.fingerprint(i,lab),report=saved.report;box.classList.toggle('needs-revision',!report.passed||stale);box.append(el('h3','上次送出初步評分：'+report.score+'/100'),el('p',stale?'草稿已變更：以下為上次建議，修改後請重新送出。':report.passed?'已達初步門檻，可繼續學習。仍請確認教師的正式回饋。':'目前需要修正，請參考下方建議後再次送出。'));
 report.tasks.forEach((task,j)=>{const card=el('article',undefined,'feedback-task');card.append(el('h4',data[i].tasks[j]+' · '+task.score+' 分'+(task.passed?'（達門檻）':'（需修正）')));const list=el('ul');if(task.issues.length)task.issues.forEach(t=>list.append(el('li',t)));else list.append(el('li','已找到本題主要重點，請再次確認內容與證據。'));card.append(list);box.append(card)})}
 render();
}
function submitLesson(i){
 const lab=readLab(),report=SolarProgress.review(i,lab),fingerprint=SolarProgress.fingerprint(i,lab);lab.submissions=lab.submissions||{};lab.submissions[i]={version:SolarProgress.version,fingerprint,submittedAt:new Date().toISOString()};lab.feedback=lab.feedback||{};lab.feedback[i]={fingerprint,report};writeLab(lab);updateLessonGate(i);$('#reviewFeedback').scrollIntoView({block:'start',behavior:'smooth'});toast(report.passed?'已通過初步檢核，下一關已解鎖':'已提供修改建議，修正後可以再次送出');
}
document.addEventListener('input',e=>{if($('#lesson').open&&e.target.closest('#lessonBody'))updateLessonGate(selected)});
$('#clear').onclick=()=>{if(confirm('確定清除本瀏覽器的全部作答、量測表與學習進度嗎？課程名稱會保留。')){localStorage.removeItem('solar-lab-v1');done={};save();selected=0;render();toast('全部作答與進度已重設')}};
const stateAtStart=gateState();selected=stateAtStart.counts.findIndex((c,i)=>stateAtStart.unlocked[i]&&c<3);if(selected<0)selected=data.length-1;render();





