'use strict';
// 完成狀態只由作答與量測表計算；忽略舊版手動勾選紀錄。
const gateState=()=>SolarProgress.progress(readLab());
count=function(i){return gateState().counts[i]||0};
const originalRender=render;
render=function(){originalRender();const state=gateState();$$('#cards .course').forEach(b=>{const i=Number(b.dataset.island);if(i<0)return;const locked=!state.unlocked[i];b.classList.toggle('locked',locked);b.setAttribute('aria-disabled',String(locked));b.querySelector('.status').textContent=locked?'尚未解鎖':count(i)===3?'已完成':count(i)?'填寫中':'可開始';if(locked)b.setAttribute('aria-label',data[i].name+'，請先完成上一關')});const start=$('#detail .primary');if(start&&!state.unlocked[selected]){start.disabled=true;start.textContent='請先完成上一關'}};
const taskPrompts=[
 ['請用自己的話說明陽光如何轉成電能，以及電能如何供風扇使用。','請預測光照或板面角度改變時，輸出電功率會如何變化，並說明理由。','請寫出操縱變因、保持不變的條件，以及你要量測的項目。'],
 ['請抄錄行動電源的標示容量、對應電壓、額定容量及 USB 輸出規格。','請寫出 mAh 換算 Wh 的算式、代入數值、結果與單位。','請先預測風扇能運轉多久，並寫出你的假設與理由。'],
 ['請記錄組員分工、固定的風扇檔位，以及接線、護網與電力計歸零的檢查結果。',null,'請寫出第 1～10 分鐘平均功率、10 分鐘耗能、假設效率、推估運轉時間的算式與結果，並用自己的話說明。'],
 ['請列出一項 AI 說法、你的實測或手算證據，以及採用、修正或拒絕的理由。','請填寫報告摘要、AI 工具與日期、AI 協助內容及自己完成的部分；若未使用 AI，請說明自己的查證方法。','請填寫教師完整放電實測結果、與自己推估的差異及原因；尚未取得數據時，請先向教師確認。']
];
openLesson=function(i){
 const state=gateState();if(!state.unlocked[i]){selected=state.unlocked.findLastIndex(Boolean);render();toast('請先填寫完成上一關的必填內容');return}
 selected=i;render();const body=$('#lessonBody'),d=data[i];body.replaceChildren();body.append(el('div','第 '+(i+1)+' 關 · '+d.tag,'tags'),el('h2',d.name),el('p','填寫必填內容後會自動勾選完成，全部完成才可前往下一關。此處檢查填寫完整性，內容正確性由教師評閱。'));
 d.tasks.forEach((t,j)=>{const label=el('div',undefined,'task'),input=el('input');input.type='checkbox';input.disabled=true;input.dataset.task=j;input.checked=state.tasks[i][j];input.setAttribute('aria-label',t+'（系統自動判定）');const tx=el('span');tx.append(el('strong',t),el('small','等待填寫完成'));label.append(input,tx);body.append(label)});
 window.enrichSolarLesson(i,body);
 const form=el('section',undefined,'required-answers');form.append(el('h3','本關必填作答'),el('p','每題至少填寫 10 個中文字或英數字，空白與標點不計。內容即時儲存在此瀏覽器。'));
 d.tasks.forEach((task,j)=>{
  if(i===2&&j===1){form.append(el('p','量測任務：請填妥上方 0～10 分鐘全部 55 個數值欄位（V 必須大於 0，其餘可為 0），並在第 5、10 分鐘的「觀察」各寫至少 10 個字，說明溫度與聲音等現象。','measurement-requirement'));return}
  const label=el('label',undefined,'answer-label');label.append(el('strong',task),el('span',taskPrompts[i][j]));const text=el('textarea');text.rows=3;text.required=true;text.dataset.answer=i+'-'+j;text.setAttribute('aria-label',task+'必填作答');text.placeholder='至少 10 個中文字或英數字';text.value=(readLab().answers||{})[i+'-'+j]||'';const status=el('small',undefined,'answer-status');text.oninput=()=>{const lab=readLab();lab.answers=lab.answers||{};lab.answers[i+'-'+j]=text.value;writeLab(lab)};label.append(text,status);form.append(label);
 });body.append(form);
 const bar=el('div',undefined,'gate-footer'),message=el('p',undefined,'gate-message'),next=el('button',undefined,'primary');next.id='nextStage';next.onclick=()=>{if(count(i)!==3)return;if(i<3){openLesson(i+1);$('#lesson').scrollTop=0}else{$('#lesson').close();toast('恭喜完成全部四關！');view='progress';$$('.nav').find(b=>b.dataset.view==='progress').click()}};bar.append(message,next);body.append(bar);updateLessonGate(i);if(!$('#lesson').open)$('#lesson').showModal();$('#lesson').scrollTop=0;
};
function updateLessonGate(i){const state=gateState(),body=$('#lessonBody');body.querySelectorAll('input[data-task]').forEach(input=>{const j=+input.dataset.task;input.checked=state.tasks[i][j];input.parentElement.querySelector('small').textContent=input.checked?'已填寫完成，自動勾選':'尚有必填內容未完成'});body.querySelectorAll('textarea[data-answer]').forEach(text=>{const valid=SolarProgress.textComplete(text.value);text.parentElement.querySelector('.answer-status').textContent=valid?'已填寫完成':'至少需要 10 個中文字或英數字';text.setAttribute('aria-invalid',String(!valid))});const complete=state.counts[i]===3;const button=$('#nextStage');button.disabled=!complete;button.textContent=i<3?'前往下一關：'+data[i+1].name:'完成旅程，查看成就';body.querySelector('.gate-message').textContent=complete?(i<3?'本關已自動完成，下一關已解鎖。':'全部關卡已填寫完成！'):'已完成 '+state.counts[i]+'/3 個任務，填妥全部必填內容才能前往下一關。';render()}
document.addEventListener('input',e=>{if($('#lesson').open&&e.target.closest('#lessonBody'))updateLessonGate(selected)});
$('#clear').onclick=()=>{if(confirm('確定清除本瀏覽器的全部作答、量測表與學習進度嗎？課程名稱會保留。')){localStorage.removeItem('solar-lab-v1');done={};save();selected=0;render();toast('全部作答與進度已重設')}};
const stateAtStart=gateState();selected=stateAtStart.counts.findIndex((c,i)=>stateAtStart.unlocked[i]&&c<3);if(selected<0)selected=3;render();

