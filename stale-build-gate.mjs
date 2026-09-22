import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const files=['app.js','sw.js','manifest.webmanifest','release.json','data/courses.json','data/skills.json','data/activities.json','data/printables.json'];
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
const [manifest,release,sw]=await Promise.all(['manifest.webmanifest','release.json','sw.js'].map(async f=>f.endsWith('js')?readFile(f,'utf8'):JSON.parse(await readFile(f,'utf8'))));
const versions=[manifest.version,release.version,/RELEASE_VERSION='([^']+)'/.exec(sw)?.[1],/CACHE='xixi-explore-v([^']+)'/.exec(sw)?.[1]];
if(!versions.every(v=>v==='0.4.0'))throw new Error('stale-build identity mismatch: '+versions.join(','));
console.log(JSON.stringify({status:'PASS',version:'0.4.0',hashes:Object.fromEntries(await Promise.all(files.map(async f=>[f,await hash(f)])))}));
