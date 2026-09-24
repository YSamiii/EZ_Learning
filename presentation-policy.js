import {ageInfo} from './profile.js';

export const PRESCHOOL_POLICY=Object.freeze({id:'preschool',audioFirst:true,visualFirst:true,maxChildInstruction:12,maxChildSentence:16});
export function presentationPolicy(profile){
  const months=ageInfo(profile?.birthDate)?.months;
  return months==null||months<48?PRESCHOOL_POLICY:{id:'emerging-reader',audioFirst:false,visualFirst:true,maxChildInstruction:16,maxChildSentence:24};
}

const prompts=Object.freeze({
  listen_choose:'听一听，找一找',image_choose:'看图，选一选',match:'配一配',
  word_understanding:'找一找',image_sentence:'听一听，选一选',
  trace:'用手指描一描',speak:'说一说',choice:'想一想',
  sequence:'排排队',info:'看一看',printable:'一起做一做',real_world:'试一试',
});

export const childPrompt=activity=>activity.child_prompt||prompts[activity.activity_type]||'看一看';
export const audioPrompt=activity=>activity.audio_prompt||activity.audio_text||childPrompt(activity);
export const parentCopy=activity=>({
  goal:activity.parent_goal||activity.title,
  note:activity.parent_note||activity.body||'',
  extension:activity.parent_extension||'',
  explanation:activity.correct_feedback||'',
});

export function childTextIssues(activity,policy=PRESCHOOL_POLICY){
  const prompt=childPrompt(activity).trim();
  const issues=[];
  if(!prompt)issues.push('missing child instruction');
  if([...prompt.replace(/[，。！？、\s]/gu,'')].length>policy.maxChildInstruction)issues.push('child instruction too long');
  if(/[。！？].*[。！？]/u.test(prompt))issues.push('multiple child sentences');
  if(/(?:请根据|以下|最匹配|观察图片中的|重新观察|完成本步骤)/u.test(prompt))issues.push('adult-style instruction');
  if(/\b(?:image_choose|listen_choose|word_understanding|image_sentence|real_world)\b/u.test(prompt))issues.push('internal schema key');
  if(!activity.scene?.asset_id&&!audioPrompt(activity))issues.push('missing visual or audio cue');
  if(!audioPrompt(activity))issues.push('missing audio instruction');
  return issues;
}
