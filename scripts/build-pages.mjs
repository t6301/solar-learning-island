import fs from 'node:fs';import path from 'node:path';
const output=path.resolve('_site');if(output!==path.join(process.cwd(),'_site'))throw new Error('Invalid Pages output');
fs.mkdirSync(output,{recursive:true});for(const name of fs.readdirSync('public'))if(/\.(html|css|js|json)$/.test(name))fs.copyFileSync(path.join('public',name),path.join(output,name));
fs.writeFileSync(path.join(output,'site-config.js'),"window.SOLAR_API_BASE='https://learning-islands-master-1124.nearbycress1.chatgpt.site';\n");
fs.writeFileSync(path.join(output,'.nojekyll'),'');console.log('GitHub Pages static site ready in _site/');
