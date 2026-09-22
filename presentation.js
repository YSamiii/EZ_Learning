const escapeText=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const labels={
  listen_choose:'听一听，找一找',image_choose:'看图选字',match:'配一配',
  image_sentence:'看图读句子',speak:'说一说',trace:'一起描一描',
  word_understanding:'认识词语',choice:'想一想',sequence:'排排队',
  info:'看一看',printable:'一起做一做',real_world:'到生活里试试',
};
export const activityLabel=type=>labels[type]||'小小发现';

const flower='<svg viewBox="0 0 170 150" aria-hidden="true"><path d="M85 132V62M85 105C58 76 34 89 32 105c27 17 43 15 53 0M85 95c28-31 53-26 57-11-21 23-42 25-57 11" fill="#83ac75" stroke="#6c9b6d" stroke-width="4" stroke-linejoin="round"/><circle cx="85" cy="52" r="15" fill="#e9a464"/><g fill="#f6c0b6"><ellipse cx="85" cy="25" rx="15" ry="22"/><ellipse cx="85" cy="79" rx="15" ry="22"/><ellipse cx="58" cy="52" rx="22" ry="15"/><ellipse cx="112" cy="52" rx="22" ry="15"/></g><circle cx="85" cy="52" r="12" fill="#f4d782"/></svg>';
const rain='<svg viewBox="0 0 200 145" aria-hidden="true"><path d="M41 63c0-20 18-35 38-31 13-23 48-19 57 6 24-4 40 14 39 31 0 17-15 28-32 28H57C36 97 28 79 41 63Z" fill="#fffdf5" stroke="#9bb9ba" stroke-width="4"/><path d="m61 108-8 17m47-17-8 17m47-17-8 17" stroke="#79a8c4" stroke-width="7" stroke-linecap="round"/><path d="M102 135c5-21 22-24 31-18-3 17-16 22-31 18Z" fill="#92b889"/></svg>';
const moon='<svg viewBox="0 0 190 190" aria-hidden="true"><circle cx="95" cy="95" r="76" fill="#fff5c8"/><circle cx="75" cy="68" r="15" fill="#f3e8b1" opacity=".58"/><circle cx="119" cy="105" r="23" fill="#f3e8b1" opacity=".5"/><circle cx="68" cy="127" r="9" fill="#f3e8b1" opacity=".52"/></svg>';
const mooncake='<svg viewBox="0 0 170 140" aria-hidden="true"><ellipse cx="85" cy="106" rx="67" ry="22" fill="#8f5e4d" opacity=".14"/><path d="M24 63c0-25 27-44 61-44s61 19 61 44v30c0 24-27 39-61 39S24 117 24 93Z" fill="#c98353"/><ellipse cx="85" cy="63" rx="61" ry="43" fill="#e8b977" stroke="#b77951" stroke-width="4"/><circle cx="85" cy="63" r="29" fill="none" stroke="#c78b5d" stroke-width="5"/><path d="M85 38v50M60 63h50" stroke="#c78b5d" stroke-width="4" stroke-linecap="round"/></svg>';
const seed='<svg viewBox="0 0 210 150" aria-hidden="true"><path d="M16 105c43-15 136-15 179 0v45H16Z" fill="#a77b5c"/><path d="M107 110V56" stroke="#6b9870" stroke-width="8" stroke-linecap="round"/><path d="M107 82C74 42 52 53 50 73c25 24 44 22 57 9ZM107 74c20-38 51-42 60-26-9 29-36 40-60 26Z" fill="#96bd83" stroke="#6b9870" stroke-width="3"/><ellipse cx="107" cy="114" rx="16" ry="11" fill="#d6a470"/><path d="M35 132h140" stroke="#c69871" stroke-width="5" stroke-linecap="round"/></svg>';
const flashlight='<svg viewBox="0 0 200 145" aria-hidden="true"><path d="M20 48 91 61 96 91 19 104Z" fill="#ffe8a2" opacity=".74"/><path d="M90 57h38v43H90Z" fill="#b4775d"/><path d="M127 68h45v21h-45Z" fill="#e9ad79"/><path d="M90 57h14v43H90Z" fill="#785d61"/><path d="M165 69h14v19h-14Z" fill="#f9dc99"/></svg>';
const lantern='<svg viewBox="0 0 100 150" aria-hidden="true"><path d="M50 3v20m0 99v21" stroke="#f2d69e" stroke-width="5"/><path d="M23 29c15-13 39-13 54 0v77c-15 13-39 13-54 0Z" fill="#cf8067"/><path d="M23 29h54M23 106h54" stroke="#edb987" stroke-width="7"/><path d="M39 24c-8 34-8 54 0 87m22-87c8 34 8 54 0 87" fill="none" stroke="#e6a07a" stroke-width="5"/><path d="m39 139 11 9 11-9" fill="none" stroke="#eab076" stroke-width="4"/></svg>';
const shape='<svg viewBox="0 0 160 140" aria-hidden="true"><circle cx="45" cy="88" r="27" fill="#e9b976"/><path d="m101 37 39 70H62Z" fill="#89b8a2"/></svg>';

function chineseScene(activity){
  const type=activity.activity_type;
  const focus=activity.scene.elements?.find(item=>/[\u3400-\u9fff]/u.test(item))||activity.answer?.match(/[\u3400-\u9fff]/u)?.[0]||'字';
  const phrase=escapeText(activity.answer||activity.prompt||activity.title);
  let main=type==='listen_choose'?'<div class="sound-orb" aria-hidden="true"><span class="sound-wave wave-one"></span><span class="sound-wave wave-two"></span><span class="sound-note">♪</span></div><div class="scene-small-art">'+flower+'</div>':
    type==='image_choose'?'<div class="chinese-picture">'+flower+'</div><div class="picture-frame">春天的花园</div>':
    type==='match'?'<div class="scene-match"><span class="scene-glyph">'+escapeText(focus)+'</span><span class="scene-dots">••••</span><span class="scene-word">'+phrase+'</span></div>':
    type==='image_sentence'?'<div class="chinese-picture rain-picture">'+rain+'</div><div class="picture-frame">'+phrase+'</div>':
    type==='speak'?'<div class="scene-speech">'+escapeText(activity.body)+'</div><div class="scene-speak-flower">'+flower+'</div>':
    '<div class="scene-trace-grid"><span>'+escapeText(focus)+'</span></div><div class="scene-pencil" aria-hidden="true">✎</div>';
  return '<div class="art-scene art-chinese art-'+escapeText(type)+'" data-scene="'+escapeText(activity.scene.asset_id)+'"><div class="scene-glow"></div>'+main+'</div>';
}
function moonScene(activity){
  const type=activity.activity_type;
  const elements=activity.scene.elements||[];
  const showCake=elements.includes('mooncake')||type==='word_understanding';
  const showLantern=elements.includes('lantern')||type==='printable';
  const motif=type==='speak'?'<div class="moon-talk">'+escapeText(activity.title)+'</div>':type==='info'&&elements.includes('story')?'<div class="story-book"><span>传说</span><i>✦</i></div>':type==='real_world'?'<div class="window-frame"><span>一起望月</span></div>':'';
  return '<div class="art-scene art-moon art-'+escapeText(type)+'" data-scene="'+escapeText(activity.scene.asset_id)+'"><div class="moon-stars" aria-hidden="true">✦　·　✧</div><div class="moon-disc">'+moon+'</div><div class="moon-cloud moon-cloud-one"></div><div class="moon-cloud moon-cloud-two"></div><div class="moon-hills"></div>'+(showCake?'<div class="moon-cake">'+mooncake+'</div>':'')+(showLantern?'<div class="moon-lantern">'+lantern+'</div>':'')+motif+'</div>';
}
function seedScene(activity){
  const type=activity.activity_type;
  const elements=activity.scene.elements||[];
  const stages=String(activity.answer||'').split('→').map(part=>part.trim());
  const stage=type==='sequence'?'<div class="seed-stages">'+stages.map((part,index)=>(index?'<b>→</b>':'')+'<span>'+escapeText(part)+'</span>').join('')+'</div>':type==='real_world'?'<div class="seed-observe">今天看看它</div>':'';
  return '<div class="art-scene art-seed art-'+escapeText(type)+'" data-scene="'+escapeText(activity.scene.asset_id)+'"><div class="seed-sun"></div><div class="seed-cloud"></div>'+(elements.includes('water')?'<div class="seed-drop">'+rain+'</div>':'')+'<div class="seed-main">'+seed+'</div><div class="seed-soil"></div>'+stage+'</div>';
}
function shadowScene(activity){
  const type=activity.activity_type;
  const dark=activity.id.endsWith('question');
  const direction=activity.id.endsWith('direction');
  return '<div class="art-scene art-shadow art-'+escapeText(type)+(dark?' scene-dim':'')+'" data-scene="'+escapeText(activity.scene.asset_id)+'"><div class="shadow-light">'+flashlight+'</div><div class="light-beam"></div><div class="shadow-ground"></div><div class="shadow-object"><span></span></div><div class="shadow-cast"></div>'+(direction?'<div class="shadow-direction"><span>光从左边来</span><b>→</b></div>':'')+'</div>';
}
function genericScene(activity){return '<div class="art-scene art-generic" data-scene="'+escapeText(activity.scene.asset_id)+'"><div class="generic-art">'+(activity.scene.type==='shape_sort'?shape:activity.scene.type==='map_direction'?'<span class="compass-art">东</span>':flower)+'</div></div>'}
export function sceneMarkup(activity){switch(activity.scene?.type){case 'character_focus':return chineseScene(activity);case 'moon_story':return moonScene(activity);case 'seed_growth':return seedScene(activity);case 'light_shadow':return shadowScene(activity);default:return genericScene(activity)}}

const optionArt=text=>{
  if(/右边/.test(text))return '<span class="direction-art" aria-hidden="true">→</span>';
  if(/左边/.test(text))return '<span class="direction-art" aria-hidden="true">←</span>';
  if(/月饼/.test(text))return mooncake;
  if(/月亮|圆月/.test(text))return moon;
  if(/花|春/.test(text))return flower;
  if(/雨|水|云/.test(text))return rain;
  if(/种子|发芽|长叶|土壤|阳光/.test(text))return seed;
  if(/太阳|灯|光|影|右边|左边/.test(text))return flashlight;
  if(/三角|圆形/.test(text))return shape;
  return '<span class="option-sparkle" aria-hidden="true">✦</span>';
};
const elementNames={moon:'圆月亮',mooncake:'月饼',lantern:'小灯笼',family:'和家人一起',story:'听一个故事',seed:'小种子',water:'水',sprout:'新芽',sun:'阳光',soil:'土壤',leaf:'叶子',light_source:'光源',object:'小物体',shadow:'影子',direction:'方向',compass:'指南针',triangle:'三角形',circle:'圆形',square:'正方形'};
function observationTiles(activity){const elements=(activity.scene?.elements||[]).slice(0,4);if(!elements.length)return '';return '<div class="observation-tiles">'+elements.map(item=>'<div class="observation-tile"><span class="observation-icon">'+optionArt(elementNames[item]||item)+'</span><span>'+escapeText(elementNames[item]||item)+'</span></div>').join('')+'</div>'}
function optionCard(activity,option,selected,feedback){
  const chosen=selected===option;
  const stateClass=chosen?(feedback===true?' is-correct':feedback===false?' is-incorrect':' is-selected'):'';
  const label=escapeText(option);
  const glyph=activity.activity_type==='listen_choose'||activity.activity_type==='image_choose';
  const art=glyph?'<span class="answer-glyph">'+label+'</span>':'<span class="answer-art">'+optionArt(option)+'</span>';
  return '<button type="button" class="answer-card'+stateClass+(glyph?' glyph-card':'')+'" data-answer="'+label+'" aria-pressed="'+(chosen?'true':'false')+'">'+art+'<span class="answer-text">'+label+'</span><span class="answer-mark" aria-hidden="true">'+(chosen&&feedback===true?'✓':chosen&&feedback===false?'↺':'')+'</span></button>';
}
export function optionsMarkup(activity,selected,feedback){
  if(!activity.options?.length)return '';
  const type=activity.activity_type;
  const cards=activity.options.map(option=>optionCard(activity,option,selected,feedback)).join('');
  if(type==='match'){const focus=activity.scene.elements?.find(item=>/[\u3400-\u9fff]/u.test(item))||activity.answer?.match(/[\u3400-\u9fff]/u)?.[0]||'字';return '<div class="match-board"><div class="match-source"><span class="match-source-caption">找到它的好朋友</span><strong>'+escapeText(focus)+'</strong></div><div class="match-link" aria-hidden="true">↔</div><div class="answer-list match-targets">'+cards+'</div></div>'}
  if(type==='sequence')return '<div class="answer-list sequence-answers">'+cards+'</div>';
  return '<div class="answer-list '+(type==='listen_choose'||type==='image_choose'?'answer-grid':'')+'">'+cards+'</div>';
}
export function activityExtraMarkup(activity){
  if(activity.activity_type==='trace'){const focus=activity.scene.elements?.find(item=>/[\u3400-\u9fff]/u.test(item))||activity.visual?.match(/[\u3400-\u9fff]/u)?.[0]||'字';return '<div class="trace-panel"><div class="trace-title"><span>跟着字形，用手指慢慢描</span><button type="button" data-clear-trace>重新描</button></div><div class="trace-surface"><span aria-hidden="true">'+escapeText(focus)+'</span><canvas class="trace-canvas" aria-label="描写'+escapeText(focus)+'字的画布"></canvas></div></div>'}
  if(activity.activity_type==='speak')return '<div class="speak-card"><span class="speak-icon" aria-hidden="true">◌</span><div><small>轻轻说给家人听</small><p>'+escapeText(activity.prompt||activity.body)+'</p></div></div>';
  if(activity.activity_type==='info')return '<div class="observe-note">看一看画面，再和家人聊一聊。</div>'+observationTiles(activity);
  if(activity.activity_type==='real_world')return '<div class="observe-note">可以现在试，也可以稍后和家人一起做。</div>'+observationTiles(activity);
  if(activity.activity_type==='printable')return '<div class="observe-note">活动单会在家长陪同下打开。</div>'+observationTiles(activity);
  return '';
}
