const {chromium}=require('C:/Users/saman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('node:http');
const {readFile,mkdir,writeFile}=require('node:fs/promises');
const {join,extname,normalize}=require('node:path');

const root=__dirname,oldRoot=normalize('F:/ChatGPT app/手机端/学习游戏/_work/github-sync-v0.3.1');
const output='F:/ChatGPT app/手机端/学习游戏/验收候选/v0.4.0-rc3/qa';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const report={version:'v0.4.0-rc3',checks:{},courses:{},viewports:{},errors:[]};
let activeRoot=root,browser,server;

async function startServer(){server=createServer(async(req,res)=>{const pathname=new URL(req.url,'http://127.0.0.1:4193').pathname;const file=normalize(join(activeRoot,pathname==='/'?'index.html':pathname));if(!file.startsWith(activeRoot)){res.writeHead(403);return res.end()}try{const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body)}catch{res.writeHead(404);res.end()}});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4193,'127.0.0.1',resolve)})}
const origin='http://127.0.0.1:4193/';
async function ready(page,version='0.4.0-rc3'){await page.waitForFunction(expected=>window.__XIXI_APP_VERSION__===expected&&window.__XIXI_APP_READY__===true,version,{timeout:15000})}
async function state(page){return page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,ready:window.__XIXI_APP_READY__,version:window.__XIXI_APP_VERSION__,progress:JSON.parse(localStorage.getItem('xixi-learning-progress')||'null')}))}
async function choose(page,text){const cards=page.locator('[data-answer]');const values=await cards.evaluateAll(items=>items.map(item=>item.dataset.answer));const index=values.indexOf(text);assert(index>=0,`answer ${text} missing`);await cards.nth(index).click()}
async function swInfo(page){return page.evaluate(async()=>{const registration=await navigator.serviceWorker.ready;const info=await new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('SW info timeout')),5000);channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data)};registration.active.postMessage({type:'GET_SW_INFO'},[channel.port2])});return{scope:registration.scope,state:registration.active.state,controller:navigator.serviceWorker.controller?.scriptURL,info,caches:await caches.keys()}})}
async function testCourses(page){
  const {presentationPolicy}=await import('./presentation-policy.js');
  assert(presentationPolicy({}).id==='preschool','missing DOB must default to preschool');
  assert(presentationPolicy({birthDate:'2023-09-18'}).id==='preschool','three-year-old must use preschool');
  report.checks.preschoolAgePolicy=true;
  const content=await page.evaluate(async()=>{const [courses,activities]=await Promise.all(['courses','activities'].map(name=>fetch(`./data/${name}.json`).then(r=>r.json())));return{courses:courses.courses,activities:activities.activities}});
  const courses=content.courses.filter(course=>['chinese.spring','culture.festival.mid_autumn','science.seed-journey','science.shadow-magic'].includes(course.id));
  const byActivity=Object.fromEntries(content.activities.map(activity=>[activity.id,activity]));
  const chineseTypes=new Set(courses.find(course=>course.id==='chinese.spring').steps.map(step=>byActivity[step.activity_id].activity_type));
  assert(chineseTypes.size===6,'Chinese types not six');report.checks.chineseSixTypes=true;
  for(const course of courses){
    await page.locator('[data-go="explore"]').first().click();
    await page.locator(`[data-course="${course.id}"]`).first().click();
    await page.locator('[data-start]').click();
    const scenes=[],types=[];
    for(let i=0;i<course.steps.length;i++){
      const activity=byActivity[course.steps[i].activity_id];types.push(activity.activity_type);
      const scene=page.locator('[data-scene]');assert(await scene.count()===1,`${course.id} step ${i+1} scene missing`);
      scenes.push(await scene.getAttribute('data-scene'));
      for(const width of [360,375,390]){await page.setViewportSize({width,height:740});const geometry=await page.evaluate(()=>{const stage=document.querySelector('[data-scene]').getBoundingClientRect(),copy=document.querySelector('.lesson-copy').getBoundingClientRect();return{stageHeight:stage.height,copyTop:copy.top,viewportHeight:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth,cardHeights:[...document.querySelectorAll('[data-answer]')].map(item=>item.getBoundingClientRect().height)}});assert(geometry.stageHeight>=190&&geometry.stageHeight<=230,`${course.id} step ${i+1} stage size at ${width}`);assert(geometry.copyTop<geometry.viewportHeight&&geometry.overflow<=0,`${course.id} step ${i+1} mobile layout at ${width}`);assert(geometry.cardHeights.every(height=>height>=60),`${course.id} step ${i+1} small card at ${width}`)}
      const visible=await page.locator('.lesson').innerText();
      assert(!/\b(image_choose|match|word_understanding|listen_choose|image_sentence|real_world|sequence|trace)\b/.test(visible),`${course.id} step ${i+1} leaked internal key`);
      const instruction=await page.locator('[data-child-instruction]').innerText();
      assert([...instruction.replace(/[，。！？、\s]/gu,'')].length<=12,`${course.id} step ${i+1} child instruction too long`);
      assert(await page.locator('.lesson[data-age-mode="preschool"]').count()===1,`${course.id} step ${i+1} preschool policy missing`);
      assert(await page.locator('[data-audio]').count()===1,`${course.id} step ${i+1} audio control missing`);
      assert(await page.locator('[data-parent-layer]').evaluate(el=>!el.open),`${course.id} step ${i+1} parent copy not collapsed`);
      assert(!(await page.locator('[data-child-layer]').innerText()).includes(activity.body),`${course.id} step ${i+1} parent copy leaked to child layer`);
      await page.locator('[data-parent-layer] summary').click();
      assert(await page.locator('.parent-content').isVisible(),`${course.id} step ${i+1} parent copy cannot expand`);
      await page.locator('[data-parent-layer] summary').click();
      await page.evaluate(()=>{window.__AUDIO_CALLS__=[];speechSynthesis.speak=utterance=>window.__AUDIO_CALLS__.push(utterance.text);speechSynthesis.cancel=()=>{}});
      await page.locator('[data-audio]').click();
      await page.locator('[data-audio]').click();
      assert(await page.evaluate(()=>window.__AUDIO_CALLS__.length)===2,`${course.id} step ${i+1} audio repeat failed`);
      if(activity.options?.length){
        const cards=page.locator('[data-answer]');assert(await cards.count()===activity.options.length,`${course.id} step ${i+1} option count`);
        const sizes=await cards.evaluateAll(items=>items.map(item=>({width:item.getBoundingClientRect().width,height:item.getBoundingClientRect().height})));
        assert(sizes.every(size=>size.height>=60&&size.width>=90),`${course.id} step ${i+1} small option`);
        const wrong=activity.options.find(option=>option!==activity.answer);
        await choose(page,wrong);assert(await page.locator('.answer-card.is-selected').count()===1,`${course.id} step ${i+1} selected state`);
        await page.locator('[data-check]').click();assert(await page.locator('.feedback.try').count()===1,`${course.id} step ${i+1} retry feedback`);
        assert(await page.locator('[data-next-step]').count()===0,`${course.id} step ${i+1} advanced after wrong answer`);
        await page.locator('[data-retry]').click();await choose(page,activity.answer);await page.locator('[data-check]').click();
        assert(await page.locator('.feedback.good').count()===1,`${course.id} step ${i+1} positive feedback`);
        assert(await page.locator('.answer-card.is-correct').count()===1,`${course.id} step ${i+1} correct card state`);
      }else{
        if(activity.activity_type==='trace'){
          const box=await page.locator('.trace-canvas').boundingBox();assert(box&&box.height>=200,'trace canvas missing');
          await page.mouse.move(box.x+box.width*.3,box.y+box.height*.3);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.7,{steps:6});await page.mouse.up();
          const marked=await page.locator('.trace-canvas').evaluate(canvas=>{const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;for(let n=3;n<pixels.length;n+=4)if(pixels[n])return true;return false});
          assert(marked,'trace input did not draw');
        }
        await page.locator('[data-complete-gentle]').click();assert(await page.locator('.feedback.good').count()===1,`${course.id} step ${i+1} encouragement`);
      }
      if(i===0)await page.locator('[data-next-step]').dblclick();else await page.locator('[data-next-step]').click();
      const progress=(await state(page)).progress.courses[course.id];
      assert(progress.stepIndex===Math.min(i+1,course.steps.length-1),`${course.id} step ${i+1} progress/double-tap`);
      if(i===0){await page.reload({waitUntil:'networkidle'});await ready(page);assert((await state(page)).progress.courses[course.id].stepIndex===1,`${course.id} reload persistence`);await page.locator('[data-go="explore"]').first().click();await page.locator(`[data-course="${course.id}"]`).first().click();await page.locator('[data-start]').click()}
    }
    assert((await state(page)).progress.courses[course.id].status==='complete',`${course.id} incomplete`);
    report.courses[course.id]={steps:course.steps.length,types,scenes,pass:true};
  }
  assert(report.courses['culture.festival.mid_autumn'].steps===7,'Mid-Autumn count');
  assert(report.courses['science.seed-journey'].steps===5,'Seed count');
  assert(report.courses['science.shadow-magic'].steps===5,'Shadow count');
  report.checks.courseSteps=true;report.checks.lessonViewports360_375_390=true;report.checks.correctIncorrectRetry=true;report.checks.traceDrawing=true;report.checks.progressPersistenceDoubleTap=true;report.checks.childTextDensity=true;report.checks.parentLayer=true;report.checks.audioRepeat=true;
  await page.evaluate(async()=>{const module=await import('./learning.js');for(let index=0;index<5;index++)module.recordAttempt('zh.character.spring',true);module.refreshReview(new Date(Date.now()+4*864e5))});
  await page.locator('[data-go="home"]').first().click();
  assert(await page.locator('[data-review="zh.character.spring"]').count()===1,'review queue missing');report.checks.review=true;
  await page.locator('[data-go="print"]').first().click();await page.locator('[data-print-id]').first().click();
  assert(Object.keys((await state(page)).progress.printables).length>0,'printable state missing');report.checks.printable=true;
}
async function testViewports(page){for(const width of [360,375,390]){await page.setViewportSize({width,height:740});const evidence=[];for(const route of ['home','explore','game','print','parent']){await page.locator(`[data-go="${route}"]`).first().click();const current=await state(page);assert(current.ready&&current.version==='0.4.0-rc3'&&current.scroll<=current.width,`${route} overflow at ${width}`);evidence.push({route,scroll:current.scroll});}await page.locator('[data-edit]').click();const date=await page.locator('input[type=date]').boundingBox();assert(date&&date.x>=0&&date.x+date.width<=width,`date containment ${width}`);await page.locator('#profile-form .primary').click();await page.locator('[data-go="home"]').first().click();report.viewports[width]=evidence}report.checks.routing=true;report.checks.noOverflow=true;report.checks.dateContainment=true}
async function testMigration(){activeRoot=oldRoot;const context=await browser.newContext({viewport:{width:375,height:740}}),page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(String(error)));await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>{localStorage.setItem('xixi-profiles',JSON.stringify({version:2,activeProfileId:'kid',profiles:[{id:'kid',nickname:'乐乐',birthDate:'2023-01-02',languages:['普通话'],learningGoals:['science']}]}));localStorage.setItem('xixi-course-progress',JSON.stringify({'seed-journey':{courseId:'seed-journey',stepIndex:2,status:'active'},'shadow-play':{courseId:'shadow-play',stepIndex:1,status:'complete',completedAt:'2026-01-01T00:00:00.000Z'}}))});await page.evaluate(()=>navigator.serviceWorker.ready);activeRoot=root;await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update()});await page.waitForFunction(async()=>{const registration=await navigator.serviceWorker.getRegistration();return registration?.active?.state==='activated'&&(await caches.keys()).includes('xixi-preview-v0.4.0-rc3')},{timeout:20000});await page.waitForFunction(async()=>{const worker=navigator.serviceWorker.controller;if(!worker)return false;const channel=new MessageChannel(),answer=new Promise(resolve=>{const timer=setTimeout(()=>resolve(null),800);channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data)}});worker.postMessage({type:'GET_SW_INFO'},[channel.port2]);return(await answer)?.version==='0.4.0-rc3'},{timeout:15000});await page.reload({waitUntil:'networkidle'});try{await ready(page)}catch(error){const snapshot=await page.evaluate(()=>({version:window.__XIXI_APP_VERSION__,ready:window.__XIXI_APP_READY__,body:document.body.innerText.slice(0,200),controller:navigator.serviceWorker.controller?.scriptURL}));throw Error(`migration boot: ${JSON.stringify({snapshot,errors,reason:String(error)})}`)}const result=await page.evaluate(async()=>{const progress=JSON.parse(localStorage.getItem('xixi-learning-progress'));const migration=JSON.parse(localStorage.getItem('xixi-migrations'));const selector=(await import('./learning.js')).selectMigrationRuntimeState();return{progress,migration,runtime:window.__XIXI_MIGRATION__,selector}});assert(result.progress.courses['science.seed-journey'].stepIndex===2,'seed migration');assert(result.progress.courses['science.shadow-magic'].status==='complete','shadow migration');assert(result.migration['0.3.1-to-0.4.0']?.completed,'migration metadata');assert(JSON.stringify(result.runtime)===JSON.stringify(result.selector),'migration runtime equality');const worker=await swInfo(page);assert(worker.info.version==='0.4.0-rc3'&&worker.info.cacheName==='xixi-preview-v0.4.0-rc3','SW upgrade identity');report.checks.migrationRegression=true;report.checks.migrationRuntimeEquality=true;report.checks.swUpgradeRegression=true;await context.close()}

(async()=>{try{await mkdir(output,{recursive:true});await startServer();browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const page=await context.newPage();page.on('pageerror',error=>report.errors.push(String(error)));await page.addInitScript(()=>{window.print=()=>{window.__PRINT_CALLED__=(window.__PRINT_CALLED__||0)+1}});await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>localStorage.setItem('xixi-profiles',JSON.stringify({version:2,activeProfileId:'kid',profiles:[{id:'kid',nickname:'熹熹',birthDate:'2023-09-18',languages:['普通话'],learningGoals:['chinese','culture','science']}]})));await page.reload({waitUntil:'networkidle'});await ready(page);await page.evaluate(()=>navigator.serviceWorker.ready);const initial=await swInfo(page);assert(initial.scope===origin&&initial.info.cacheName==='xixi-preview-v0.4.0-rc3'&&initial.info.version==='0.4.0-rc3','RC3 SW identity');report.checks.swIdentity=true;await testViewports(page);await testCourses(page);await context.close();await testMigration();assert(report.errors.length===0,'browser errors');report.overallPass=true;console.log(JSON.stringify({status:'PASS',checks:report.checks,courses:Object.fromEntries(Object.entries(report.courses).map(([id,value])=>[id,value.steps]))}))}catch(error){report.overallPass=false;report.error=String(error);console.error(JSON.stringify({status:'FAIL',error:String(error)}));process.exitCode=1}finally{await mkdir(output,{recursive:true});await writeFile(join(output,'qa-report-v0.4.0-rc3.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(resolve=>server?.close(resolve))}})();
