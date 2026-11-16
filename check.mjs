import fs from 'node:fs/promises';import vm from 'node:vm';import assert from 'node:assert/strict';
const dir=new URL('./',import.meta.url),data=JSON.parse(await fs.readFile(new URL('dist/assets/production.json',dir),'utf8')),script=await fs.readFile(new URL('dist/assets/app.js',dir),'utf8');
const persisted=new Map(),handlers={};
function environment(){const els=new Map();function element(){return{hidden:true,innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},focus(){},scrollIntoView(){},querySelectorAll(){return[]},addEventListener(){},setSelectionRange(){}}}const document={querySelector:s=>{if(!els.has(s))els.set(s,element());return els.get(s)},addEventListener:(name,fn)=>handlers[name]=fn,body:{classList:{add(){},remove(){}},style:{}},activeElement:{isConnected:false}};const context={document,window:{PRODUCTION_DATA:data,addEventListener(){},print(){}},location:{hash:'#overview'},localStorage:{getItem:k=>persisted.get(k),setItem:(k,v)=>persisted.set(k,v)},console,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},URL,Blob,Date,confirm:()=>false,navigator:{}};vm.createContext(context);vm.runInContext(script,context);return {context,els}}
let{context,els}=environment();assert(els.get('#main').innerHTML.includes('Every story starts here.'));
for(const name of ['overview','listings','communities','scripts','routes','faq','launch','files','settings']){vm.runInContext(`view='${name}';render()`,context);assert(els.get('#main').innerHTML.length>500,name);assert(!els.get('#main').innerHTML.includes('undefined'),name+' undefined');}
for(const name of ['ABACO','ELEUTHERA','EXUMA']){vm.runInContext(`view='listings';filters.island='${name}';render()`,context);assert.equal((els.get('#main').innerHTML.match(/class="listing-card"/g)||[]).length,3,name)}
vm.runInContext("filters.island='all';filters.query='67963';render()",context);assert.equal((els.get('#main').innerHTML.match(/class="listing-card"/g)||[]).length,1);
vm.runInContext("filters.query='ZZZZnonexistent';render()",context);assert(els.get('#main').innerHTML.includes('No matches yet'));
vm.runInContext("listingModal('L20')",context);assert(els.get('#modal-content').innerHTML.includes('PRICE HOLD'));
vm.runInContext("communityModal('C07')",context);assert(els.get('#modal-content').innerHTML.includes('Tambearly'));
vm.runInContext("assetModal('L01-H')",context);assert(els.get('#modal-content').innerHTML.includes('Guest suite')||els.get('#modal-content').innerHTML.includes('GUEST SUITE'));
vm.runInContext("assetModal('F01',true)",context);assert(els.get('#modal-content').innerHTML.includes('teleprompter'));
vm.runInContext("setAsset('L01-T','status','Filmed');setAsset('L01-T','notes','Take 2 preferred')",context);assert.equal(JSON.parse(persisted.get('sienna-bahamas-production-v1')).data.assets['L01-T'].status,'Filmed');
({context,els}=environment());assert.equal(vm.runInContext("stage('L01-T')",context),'Filmed');
vm.runInContext("const imported=validImport({application:'sienna-bahamas-production',version:1,data:{assets:{'L01-T':{status:'Published',notes:'<script>alert(1)</script>'},BOGUS:{status:'Published'}},properties:{},routeDates:{},domain:'studio.example.com'}});state=imported;assetModal('L01-T')",context);assert(els.get('#modal-content').innerHTML.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));assert.equal(vm.runInContext("state.assets.BOGUS",context),undefined);
// Notes must survive reloads, remain scoped, and travel with progress backups.
const notesToCheck={'module:communities':'Community shoot ideas','property:L01':'Capture the pool at sunset','property:L02':'Confirm the best entrance','community:C01':'Dining exterior permissions','route:D05':'Allow time for room tone','asset:F01':'Keep the answer concise'};
for(const [key,text]of Object.entries(notesToCheck))assert.equal(vm.runInContext(`writeNote(${JSON.stringify(key)},${JSON.stringify(text)})`,context),true);
({context,els}=environment());
for(const [key,text]of Object.entries(notesToCheck))assert.equal(vm.runInContext(`noteRecord(${JSON.stringify(key)}).text`,context),text,key+' survives reload');
assert.equal(vm.runInContext("noteRecord('property:L03').text",context),'');
assert.equal(vm.runInContext("writeNote('property:UNKNOWN','ignore')",context),false);
const exportedNotes=vm.runInContext("JSON.stringify({application:'sienna-bahamas-production',version:1,data:state})",context);
vm.runInContext(`state=validImport(JSON.parse(${JSON.stringify(exportedNotes)}))`,context);
for(const [key,text]of Object.entries(notesToCheck))assert.equal(vm.runInContext(`noteRecord(${JSON.stringify(key)}).text`,context),text,key+' survives backup');
assert.equal(vm.runInContext("Object.keys(validImport({application:'sienna-bahamas-production',version:1,data:{assets:{},properties:{},routeDates:{}}}).notes).length",context),0,'older backups');
vm.runInContext("writeNote('property:L01','</textarea><img src=x onerror=alert(1)>');listingModal('L01')",context);
assert(els.get('#modal-content').innerHTML.includes('&lt;/textarea&gt;&lt;img'));
assert(!els.get('#modal-content').innerHTML.includes('<img src=x'));
vm.runInContext("view='communities';render();communityModal('C01')",context);
assert(els.get('#main').innerHTML.includes('data-workspace-note="module:communities"'));
assert(els.get('#modal-content').innerHTML.includes('data-workspace-note="community:C01"'));
vm.runInContext("view='faq';render()",context);assert(els.get('#main').innerHTML.includes('Keep the answer concise'));
vm.runInContext("assetModal('F01')",context);assert(els.get('#modal-content').innerHTML.includes('Keep the answer concise'));
const bounded=vm.runInContext("validImport({application:'sienna-bahamas-production',version:1,data:{notes:{'module:overview':{text:'x'.repeat(12000)},'property:UNKNOWN':{text:'ignore'}}}})",context);
assert.equal(bounded.notes['module:overview'].text.length,10000);assert.equal(bounded.notes['property:UNKNOWN'],undefined);
const storedBeforeFailure=persisted.get('sienna-bahamas-production-v1');context.localStorage.setItem=()=>{throw Error('Quota exceeded')};
assert.equal(vm.runInContext("writeNote('module:overview','Unsaved note')",context),false);assert.equal(persisted.get('sienna-bahamas-production-v1'),storedBeforeFailure);
assert(els.get('.device-note').textContent.includes('not saved'));
for(const f of ['Bahamas_Master_Production_Funnel.docx','Bahamas_Production_Tracker.xlsx','Production_Map.html'])assert((await fs.stat(new URL('dist/downloads/'+f,dir))).size>1000);
const html=await fs.readFile(new URL('dist/index.html',dir),'utf8');assert(html.includes('window.PRODUCTION_DATA='));assert(!html.includes('type="module"'));assert(html.includes('#071B2C')&&html.includes('Bodoni'));
assert(html.includes('rel="stylesheet" media="print"'), 'web fonts must not block first render');
vm.runInContext("view='routes';render()",context);assert(!els.get('#main').innerHTML.includes('<iframe'),'no map request before user interaction');assert(els.get('#main').innerHTML.includes('Load area map'));
vm.runInContext("loadRouteMap('D05')",context);assert(els.get('#route-map-slot').innerHTML.includes('<iframe'));assert(els.get('#route-map-slot').innerHTML.includes('The%20Rum%20Club'));
const inlineScripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(inlineScripts.length,2,'standalone scripts');for(const [index,match] of inlineScripts.entries())new vm.Script(match[1],{filename:`standalone-script-${index}.js`});
console.log('PASS: nine views, island and MLS filters, empty state, property and community cards, feature and FAQ scripts, teleprompter markup, progress and scoped note persistence, note backup round trips and safe rendering, legacy backups, storage failure handling, import filtering and safe text rendering, three downloads and standalone build.');
