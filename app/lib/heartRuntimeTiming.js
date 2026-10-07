// Native SVG animation timing only; selection and playback remain owned by Home.
export function heartBeatPeriod(bpm){
 const value=Number(bpm);
 return 60/Math.max(40,Math.min(180,Number.isFinite(value)&&value>0?value:60));
}

export function syncHeartAnimations(host,previousPeriod,period,playing){
 const animations=(host?.getAnimations?.({subtree:true})||[])
  .filter(animation=>animation.effect?.target?.closest?.("[data-heart-motion]"));
 const previousMs=Math.max(.001,previousPeriod)*1000;
 const phase=((Number(animations[0]?.currentTime)||0)%previousMs)/previousMs;
 for(const animation of animations){
  animation.currentTime=phase*period*1000;
  if(playing)animation.play();else animation.pause();
 }
}
