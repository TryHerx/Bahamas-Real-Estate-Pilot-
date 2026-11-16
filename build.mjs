import fs from 'node:fs/promises';
const [html,css,js,data]=await Promise.all(['index.template.html','dist/assets/styles.css','dist/assets/app.js','dist/assets/production.json'].map(p=>fs.readFile(new URL(p,import.meta.url),'utf8')));
const safe=s=>s.replace(/<\/script/gi,'<\\/script');
const out=html.replace('<link rel="stylesheet" href="./assets/styles.css">',`<style>${css}</style>`).replace('<script type="module" src="./assets/app.js"></script>',`<script>window.PRODUCTION_DATA=${safe(data)};</script><script>${safe(js)}</script>`);
await fs.writeFile(new URL('dist/index.html',import.meta.url),out);
console.log('Built standalone dashboard with '+JSON.parse(data).assets.length+' scripts.');
