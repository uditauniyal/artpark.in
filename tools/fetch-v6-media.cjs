const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
const posts=JSON.parse(await fs.readFile(path.join(root,'src/data/linkedin-public-posts.json'),'utf8')).posts;
const selected=[[6,'sahai-research.jpg'],[7,'calibrate.jpg'],[9,'qosmic-mirror.jpg'],[11,'rdi-milestone.jpg'],[8,'indoml.jpg']];
const records=[];
for(const [i,name] of selected){const image=posts[i].images.find(x=>x.url.includes('media.licdn')&&!/profile-display|company-logo/.test(x.url));if(!image)continue;const r=await fetch(image.url);if(!r.ok)throw Error(name+' '+r.status);await fs.writeFile(path.join(root,'public/assets/v6',name),Buffer.from(await r.arrayBuffer()));records.push({file:'/assets/v6/'+name,source:'https://www.linkedin.com/feed/update/'+posts[i].urn+'/',imageUrl:image.url,originalCaption:posts[i].text.replace(/\s+/g,' ').trim()});}
const r=await fetch('https://i.ytimg.com/vi/dBmuwQRixjk/hqdefault.jpg');if(r.ok){await fs.writeFile(path.join(root,'public/assets/v6/indiafoss.jpg'),Buffer.from(await r.arrayBuffer()));records.push({file:'/assets/v6/indiafoss.jpg',source:'https://www.youtube.com/watch?v=dBmuwQRixjk',originalCaption:'IndiaFOSS: Evaluating and monitoring AI agents in non-profits with Calibrate, Aman Dalmia.'});}
await fs.writeFile(path.join(root,'src/data/v6-asset-provenance.json'),JSON.stringify({retrievedAt:new Date().toISOString(),records},null,2));console.log(records.map(x=>x.file).join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1});
