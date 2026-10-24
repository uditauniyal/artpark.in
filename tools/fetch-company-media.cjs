const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const list=[
['yaanendriya-product.png','https://yaanendriya.com/api/uploads/bf15563c-afe5-416b-a264-7e546a74bffb-Syncore_Nano_Render_1.png','https://yaanendriya.com/','Yaanendriya Syncore Nano product render'],
['strider-product.png','https://static.wixstatic.com/media/0d1c82_e6475689a8a142d5bb52a5adbb952ca3~mv2.png','https://strider-robotics.in/','Product image published by Strider Robotics'],
['astrome-work.webp','https://astrome.co/wp-content/uploads/2026/03/Rectangle-20.webp','https://astrome.co/','Image from Astrome’s official homepage'],
['twara-gripper.png','https://assets.zyrosite.com/dWxwzkZJNxFg3leK/tgrip2_s-mxBMk03e9GFaaq4b.png','https://twararobotics.in/','Twara TGRIP-2 soft gripper product image'],
['twara-gripper-demo.gif','https://assets.zyrosite.com/dWxwzkZJNxFg3leK/adobe-express---gripper_website-Aq2GKK00pPCOOaP9.gif','https://twararobotics.in/','Twara’s actual soft-gripper demonstration animation']
];
(async()=>{await fs.mkdir(path.join(root,'public/assets/v7'),{recursive:true});const records=await Promise.all(list.map(async([name,url,source,description])=>{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(name+' '+r.status);const b=Buffer.from(await r.arrayBuffer());await fs.writeFile(path.join(root,'public/assets/v7',name),b);return {file:'/assets/v7/'+name,source,url,description,bytes:b.length}}));await fs.writeFile(path.join(root,'src/data/v7-media-provenance.json'),JSON.stringify({checkedAt:new Date().toISOString(),records},null,2));console.log(records.map(r=>({file:r.file,bytes:r.bytes})));})().catch(e=>{console.error(e);process.exitCode=1});
