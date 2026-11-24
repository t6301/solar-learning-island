(function(root){
 'use strict';
 const textComplete=value=>typeof value==='string'&&(value.match(/[\p{L}\p{N}]/gu)||[]).length>=10;
 function measurementsComplete(rows={}){
  for(let m=0;m<=10;m++)for(const k of ['v','a','w','mah','wh']){
   const value=rows[m+'-'+k];
   if(value===undefined||value===null||String(value).trim()===''||!Number.isFinite(Number(value))||Number(value)<0||k==='v'&&Number(value)<=0)return false;
  }
  return textComplete(rows['5-obs'])&&textComplete(rows['10-obs']);
 }
 function progress(lab={}){
  const answers=lab.answers||{},tasks=Array.from({length:4},()=>[false,false,false]),unlocked=[true,false,false,false];
  for(let i=0;i<4;i++){
   if(i>0)unlocked[i]=unlocked[i-1]&&tasks[i-1].every(Boolean);
   if(unlocked[i])for(let j=0;j<3;j++)tasks[i][j]=i===2&&j===1?measurementsComplete(lab.rows):textComplete(answers[i+'-'+j]);
  }
  return {tasks,unlocked,counts:tasks.map(a=>a.filter(Boolean).length)};
 }
 root.SolarProgress={textComplete,measurementsComplete,progress};
})(typeof window==='undefined'?globalThis:window);
