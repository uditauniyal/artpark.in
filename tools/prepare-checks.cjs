const fs=require('node:fs'),path=require('node:path');const f=path.join(__dirname,'check.cjs');let s=fs.readFileSync(f,'utf8').replace("base='http://127.0.0.1:3004'","base='http://127.0.0.1:3005'");
s=s.replace("await p.locator('.backer-logos>a').count()===3","await p.locator('[data-foundation-tab]').count()===3").replace("await p.locator('.v5-backers').screenshot","await p.locator('.foundation-explorer').screenshot");
s=s.replace("versions/v4-baseline.json","versions/v5-baseline.json").replace("path.join(repo,f)","path.join(repo,'versions/v5',f)").replace("both V4 outputs unchanged","all V5 source, assets and output unchanged");
fs.writeFileSync(f,s);console.log('Prepared V6 regression checks.');
