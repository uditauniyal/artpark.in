const fs=require('node:fs'),path=require('node:path');const file=path.join(__dirname,'site.cjs');let s=fs.readFileSync(file,'utf8');
s="const {livingBuilders,ventureSupport}=require('./v7.cjs');\n"+s;
s=s.replace('ARTPARK brings IISc research, engineering labs','ARTPARK brings research, engineering labs').replace('function companiesRibbon(){return buildersDeck()}','function companiesRibbon(){return livingBuilders()}');
s=s.replace('stages()+companiesRibbon()+news()','stages()+companiesRibbon()+ventureSupport()+news()');
s=s.replace('<script src="/v6.js" defer></script>','<script src="/v6.js" defer></script><script src="/v7.js" defer></script>').replace('<link rel="stylesheet" href="/v6.css">','<link rel="stylesheet" href="/v6.css"><link rel="stylesheet" href="/v7.css">').replace('data-version="v6"','data-version="v7"');
// Inner pages receive a useful scroll navigation built from their actual section headings.
fs.writeFileSync(file,s);
const serve=path.join(__dirname,'serve.cjs');s=fs.readFileSync(serve,'utf8').replace("'.ico':'image/x-icon'","'.ico':'image/x-icon','.gif':'image/gif'");fs.writeFileSync(serve,s);console.log('V7 homepage and shared motion hooks integrated.');
