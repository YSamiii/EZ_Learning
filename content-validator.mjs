import {readFile} from 'node:fs/promises';
import {childTextIssues,PRESCHOOL_POLICY} from './presentation-policy.js';
const load=async n=>JSON.parse(await readFile(new URL('./data/'+n+'.json',import.meta.url)));
const [coursesData,activitiesData,skillsData,printablesData,presentationData]=await Promise.all(['courses','activities','skills','printables','presentation'].map(load));
const errors=[],unique=(items,label)=>{const seen=new Set;for(const x of items){if(!x.id||seen.has(x.id))errors.push(label+' duplicate/missing id '+x.id);seen.add(x.id)}return seen};
const courseIds=unique(coursesData.courses,'course'),activityIds=unique(activitiesData.activities,'activity'),skillIds=unique(skillsData.skills,'skill'),printableIds=unique(printablesData.printables,'printable'),domains=new Set(['chinese','culture','science','geography','logic']);
for(const a of activitiesData.activities){
  if(!a.skill_id||!skillIds.has(a.skill_id))errors.push(a.id+' missing skill');
  if(['choice','listen_choose','image_choose','match','word_understanding','image_sentence','sequence'].includes(a.activity_type)&&!a.options?.includes(a.answer))errors.push(a.id+' invalid answer');
  if(!a.scene?.asset_id)errors.push(a.id+' missing scene');
  const copy=presentationData.activities[a.id];
  if(!copy)errors.push(a.id+' missing presentation copy');
  else{
    for(const issue of childTextIssues({...a,...copy},PRESCHOOL_POLICY))errors.push(a.id+' '+issue);
    if(!copy.audio_prompt)errors.push(a.id+' missing explicit audio prompt');
    if(copy.audio_src&&!/^(?:\.\/)?[\w./-]+\.(?:mp3|m4a|ogg|wav)$/u.test(copy.audio_src))errors.push(a.id+' invalid audio source');
  }
}
for(const id of Object.keys(presentationData.activities))if(!activityIds.has(id))errors.push('orphan presentation copy '+id);
for(const c of coursesData.courses){if(!domains.has(c.domain))errors.push(c.id+' invalid domain');if(!c.age_range||!Number.isInteger(c.age_range.minMonths)||!Number.isInteger(c.age_range.maxMonths))errors.push(c.id+' invalid age range');const steps=new Set;for(const s of c.steps||[]){if(!s.id||steps.has(s.id))errors.push(c.id+' duplicate/missing step');steps.add(s.id);if(!activityIds.has(s.activity_id))errors.push(c.id+' missing activity '+s.activity_id)}if(!printableIds.has(c.printable_id))errors.push(c.id+' missing printable')}
for(const p of printablesData.printables){if(!courseIds.has(p.course_id))errors.push(p.id+' missing course');for(const id of p.skill_ids||[])if(!skillIds.has(id))errors.push(p.id+' missing skill '+id)}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(JSON.stringify({status:'PASS',skills:skillsData.skills.length,activities:activitiesData.activities.length,courses:coursesData.courses.length,printables:printablesData.printables.length,preschoolTextDensity:'PASS'}));
