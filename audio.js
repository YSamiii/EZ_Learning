let currentAudio=null;
export function playActivityAudio(activity,spokenText,{onStart=()=>{},onEnd=()=>{}}={}){
  currentAudio?.pause();
  currentAudio=null;
  if('speechSynthesis'in window)window.speechSynthesis.cancel();
  const source=activity.audio_src;
  onStart();
  if(source){
    const audio=new Audio(source);
    currentAudio=audio;
    audio.addEventListener('ended',onEnd,{once:true});
    audio.addEventListener('error',onEnd,{once:true});
    audio.play().catch(onEnd);
    return;
  }
  if('speechSynthesis'in window){
    const utterance=new SpeechSynthesisUtterance(spokenText);
    utterance.lang='zh-CN';
    utterance.rate=.85;
    utterance.onend=onEnd;
    utterance.onerror=onEnd;
    window.speechSynthesis.speak(utterance);
  }else onEnd();
}
