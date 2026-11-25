import fs from 'node:fs';
const assets={};for(const name of fs.readdirSync('public')){if(!/\.(html|css|js|json)$/.test(name))continue;assets['/'+name]={body:fs.readFileSync('public/'+name,'utf8'),type:name.endsWith('.js')?'text/javascript;charset=utf-8':name.endsWith('.css')?'text/css;charset=utf-8':name.endsWith('.json')?'application/json;charset=utf-8':'text/html;charset=utf-8'}}
const roster=JSON.parse(fs.readFileSync('public/roster.json','utf8').replace(/^\uFEFF/,''));
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js',fs.readFileSync('public/feedback-rules.js','utf8')+'\nconst ROSTER='+JSON.stringify(roster)+';\nconst ASSETS='+JSON.stringify(assets)+';\n'+fs.readFileSync('worker/teacher.mjs','utf8')+'\n'+fs.readFileSync('worker/backend.mjs','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built Worker with '+Object.keys(assets).length+' assets and '+roster.length+' students.');


