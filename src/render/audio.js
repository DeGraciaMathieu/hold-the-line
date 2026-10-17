import { G } from '../state/game.js';
import { rand } from '../state/random.js';
import { clamp } from '../util.js';

/* =========================================================
   Audio : tout est synthétisé (WebAudio)
   ========================================================= */
export const AU={c:null,m:null,nb:null,muted:false,last:{},streak:0};
try{AU.muted=localStorage.getItem('dernier-rempart-mute')==='1';}catch(e){}
export function initAudio(){
  if(AU.c){if(AU.c.state==='suspended')AU.c.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=new AC();AU.c=c;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=8;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.16;
  const m=c.createGain();m.gain.value=AU.muted?0:.55;m.connect(comp);comp.connect(c.destination);AU.m=m;
  const len=c.sampleRate*1.5|0,nb=c.createBuffer(1,len,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;AU.nb=nb;
}
export function bus(pan,vol){const c=AU.c,g=c.createGain();g.gain.value=vol;
  if(c.createStereoPanner&&pan){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);p.connect(AU.m);}else g.connect(AU.m);return g;}
export function nz(dst,{t=0,dur=.1,f=1000,f2,type='lowpass',q=.7,g=.5,a=.002,rate=1}){
  const c=AU.c,T=c.currentTime+t,s=c.createBufferSource();s.buffer=AU.nb;s.playbackRate.value=rate;
  const fl=c.createBiquadFilter();fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f,T);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,T+dur);
  const gn=c.createGain();gn.gain.setValueAtTime(.0001,T);gn.gain.linearRampToValueAtTime(g,T+a);gn.gain.exponentialRampToValueAtTime(.0001,T+dur);
  s.connect(fl);fl.connect(gn);gn.connect(dst);s.start(T,Math.random()*.8);s.stop(T+dur+.05);
}
export function tn(dst,{t=0,dur=.1,f=440,f2,type='sine',g=.3,a=.002}){
  const c=AU.c,T=c.currentTime+t,o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,T);if(f2)o.frequency.exponentialRampToValueAtTime(f2,T+dur);
  const gn=c.createGain();gn.gain.setValueAtTime(.0001,T);gn.gain.linearRampToValueAtTime(g,T+a);gn.gain.exponentialRampToValueAtTime(.0001,T+dur);
  o.connect(gn);gn.connect(dst);o.start(T);o.stop(T+dur+.05);
}
export function voice(dst,{f,f2,dur,g,lp,det=7,t=0,a=.15}){
  const c=AU.c,T=c.currentTime+t,fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;fl.Q.value=3;
  const gn=c.createGain();gn.gain.setValueAtTime(.0001,T);gn.gain.linearRampToValueAtTime(g,T+a);gn.gain.exponentialRampToValueAtTime(.0001,T+dur);
  fl.connect(gn);gn.connect(dst);
  for(const dd of[0,det]){const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f+dd,T);o.frequency.linearRampToValueAtTime(f2+dd,T+dur);o.connect(fl);o.start(T);o.stop(T+dur+.05);}
}
export const SND={
  pistol:d=>{nz(d,{dur:.16,f:3200,f2:600,g:.55});tn(d,{dur:.09,f:170,f2:55,g:.5});nz(d,{dur:.02,f:5000,type:'highpass',g:.35});},
  uzi:d=>{nz(d,{dur:.08,f:2600,f2:700,type:'bandpass',q:.8,g:.55});tn(d,{dur:.06,f:220,f2:70,g:.35,type:'triangle'});nz(d,{dur:.015,f:6000,type:'highpass',g:.25});},
  ak:d=>{nz(d,{dur:.2,f:2400,f2:450,g:.62});tn(d,{dur:.12,f:130,f2:45,g:.62});nz(d,{dur:.02,f:4500,type:'highpass',g:.35});},
  shotgun:d=>{nz(d,{dur:.42,f:1900,f2:180,g:.9});tn(d,{dur:.28,f:95,f2:32,g:.95});nz(d,{dur:.04,f:3500,type:'highpass',g:.45});nz(d,{t:.06,dur:.5,f:500,f2:120,g:.18});},
  sniper:d=>{nz(d,{dur:.07,f:5200,type:'highpass',g:.6});nz(d,{dur:.7,f:3800,f2:160,g:.85});tn(d,{dur:.45,f:85,f2:24,g:1});nz(d,{t:.12,dur:1.1,f:420,f2:90,g:.22});},
  launcher:d=>{tn(d,{dur:.16,f:240,f2:70,g:.6});nz(d,{dur:.14,f:900,f2:200,g:.4});},
  magnum:d=>{nz(d,{dur:.03,f:4800,type:'highpass',g:.5});nz(d,{dur:.32,f:3400,f2:380,g:.85});tn(d,{dur:.22,f:120,f2:34,g:.95});nz(d,{t:.08,dur:.6,f:500,f2:110,g:.16});},
  minigun:d=>{nz(d,{dur:.05,f:2800,f2:900,type:'bandpass',q:.9,g:.45});tn(d,{dur:.04,f:180,f2:70,g:.25,type:'triangle'});},
  spin:d=>{const s=G.player.spin||0;tn(d,{dur:.09,f:180+s*520,type:'sawtooth',g:.035});nz(d,{dur:.08,f:1200+s*1500,type:'bandpass',q:3,g:.05});},
  flame:d=>{nz(d,{dur:.18,f:700,f2:300,g:.35});nz(d,{dur:.1,f:2500,type:'bandpass',q:2,g:.1});},
  charge:d=>{tn(d,{dur:.48,f:200,f2:1800,type:'sawtooth',g:.1,a:.05});tn(d,{dur:.48,f:400,f2:3000,g:.07,a:.05});},
  rail:d=>{nz(d,{dur:.1,f:3000,type:'highpass',g:.7});tn(d,{dur:.5,f:1600,f2:80,type:'square',g:.22});tn(d,{dur:.6,f:60,f2:20,g:1});nz(d,{dur:.9,f:2000,f2:100,g:.6});},
  turret:d=>{nz(d,{dur:.05,f:3000,type:'bandpass',q:1.2,g:.3});tn(d,{dur:.04,f:320,f2:120,g:.15,type:'square'});},
  boom:d=>{nz(d,{dur:1.4,f:1500,f2:60,g:1});tn(d,{dur:.9,f:75,f2:22,g:1});nz(d,{dur:.05,f:4000,type:'highpass',g:.5});
    for(let k=0;k<5;k++)nz(d,{t:.08+k*.07+Math.random()*.05,dur:.06,f:2500,type:'highpass',g:.12});},
  acid:d=>{nz(d,{dur:.5,f:900,f2:120,type:'bandpass',q:2,g:.85});tn(d,{dur:.3,f:140,f2:40,g:.6});nz(d,{t:.05,dur:.6,f:300,f2:80,g:.3});},
  tink:d=>{const f=rand(3300,4600);tn(d,{dur:.06,f,type:'triangle',g:.07});tn(d,{dur:.04,f:f*1.47,g:.03});},
  shellTink:d=>{tn(d,{dur:.06,f:rand(700,900),type:'triangle',g:.08});nz(d,{dur:.03,f:1500,type:'bandpass',g:.08});},
  magOut:d=>{nz(d,{dur:.05,f:1600,type:'bandpass',q:2,g:.35});tn(d,{dur:.03,f:700,type:'square',g:.06});},
  magIn:d=>{nz(d,{dur:.06,f:900,type:'bandpass',q:2,g:.5});tn(d,{dur:.03,f:500,type:'square',g:.08});},
  rack:d=>{nz(d,{dur:.04,f:2600,type:'bandpass',q:2,g:.4});nz(d,{t:.07,dur:.05,f:1800,type:'bandpass',q:2,g:.4});},
  shellIn:d=>{nz(d,{dur:.05,f:1200,type:'bandpass',q:2,g:.4});tn(d,{dur:.04,f:420,f2:300,type:'triangle',g:.12});},
  pump:d=>{nz(d,{dur:.05,f:1900,type:'bandpass',q:2,g:.45});nz(d,{t:.09,dur:.06,f:1100,type:'bandpass',q:2,g:.5});},
  bolt:d=>{nz(d,{dur:.04,f:2600,type:'bandpass',q:3,g:.4});nz(d,{t:.1,dur:.05,f:1700,type:'bandpass',q:3,g:.4});nz(d,{t:.22,dur:.04,f:2200,type:'bandpass',q:3,g:.35});},
  empty:d=>{tn(d,{dur:.02,f:1900,type:'square',g:.12});nz(d,{dur:.015,f:5000,type:'highpass',g:.15});},
  swap:d=>{nz(d,{dur:.06,f:2000,type:'bandpass',q:1.5,g:.25});tn(d,{t:.04,dur:.02,f:1100,type:'square',g:.06});},
  hit:d=>{nz(d,{dur:.09,f:800,f2:250,g:.4,rate:rand(.8,1.2)});tn(d,{dur:.05,f:130,f2:60,g:.3});},
  marker:d=>{tn(d,{dur:.025,f:2600,type:'square',g:.045});},
  crit:d=>{tn(d,{dur:.07,f:1800,f2:2700,type:'square',g:.07});},
  clang:d=>{tn(d,{dur:.1,f:rand(900,1200),type:'triangle',g:.14});tn(d,{dur:.05,f:2400,g:.06});nz(d,{dur:.03,f:4000,type:'highpass',g:.2});},
  kill:d=>{nz(d,{dur:.26,f:900,f2:180,type:'bandpass',q:3,g:.6});tn(d,{dur:.16,f:100,f2:40,g:.45});},
  killBig:d=>{nz(d,{dur:.5,f:700,f2:90,type:'bandpass',q:2,g:.9});tn(d,{dur:.4,f:70,f2:28,g:.85});},
  groan:d=>{const f=rand(62,112);voice(d,{f,f2:f*.72,dur:rand(.7,1.1),g:.16,lp:rand(380,620)});},
  growl:d=>{voice(d,{f:92,f2:68,dur:.8,g:.24,lp:520,det:4,a:.05});nz(d,{dur:.6,f:400,f2:150,g:.2});},
  roar:d=>{voice(d,{f:72,f2:44,dur:1.4,g:.32,lp:720,det:5,a:.08});voice(d,{f:108,f2:66,dur:1.2,g:.16,lp:900,det:3,a:.08});nz(d,{dur:1,f:700,f2:120,g:.3});},
  stomp:d=>{tn(d,{dur:.5,f:60,f2:25,g:1});nz(d,{dur:.5,f:800,f2:80,g:.7});},
  spit:d=>{nz(d,{dur:.12,f:1200,f2:600,type:'bandpass',q:3,g:.3});tn(d,{dur:.08,f:300,f2:150,g:.1});},
  splat:d=>{nz(d,{dur:.2,f:700,f2:200,type:'bandpass',q:2,g:.35});},
  baseHit:d=>{tn(d,{dur:.16,f:120,f2:50,g:.5});nz(d,{dur:.14,f:600,f2:200,g:.45});if(Math.random()<.4)nz(d,{dur:.05,f:2200,type:'highpass',g:.2});},
  hurt:d=>{tn(d,{dur:.18,f:240,f2:90,type:'square',g:.18});nz(d,{dur:.14,f:700,g:.5});},
  heart:d=>{tn(d,{dur:.12,f:62,g:.6});tn(d,{t:.2,dur:.12,f:55,g:.45});},
  coin:d=>{const f=988*Math.pow(2,Math.min(AU.streak,12)/12);tn(d,{dur:.05,f,type:'square',g:.09});tn(d,{t:.05,dur:.09,f:f*1.5,type:'square',g:.08});},
  coinDrop:d=>{tn(d,{dur:.04,f:rand(2600,3200),type:'square',g:.03});},
  heal:d=>{tn(d,{dur:.08,f:660,f2:990,type:'triangle',g:.06});},
  whoosh:d=>{nz(d,{dur:.16,f:500,f2:2400,type:'bandpass',q:1.5,g:.38});},
  thump:d=>{tn(d,{dur:.1,f:150,f2:60,g:.55});nz(d,{dur:.08,f:900,g:.5});},
  horn:d=>{voice(d,{f:110,f2:104,dur:1.6,g:.14,lp:900,det:1.5,a:.3});voice(d,{f:164.8,f2:158,dur:1.6,g:.1,lp:900,det:1.5,a:.3});},
  travel:d=>{voice(d,{f:82,f2:110,dur:1.8,g:.14,lp:800,det:1.5,a:.4});voice(d,{f:123,f2:165,dur:1.8,g:.1,lp:900,det:1.5,a:.4});},
  clear:d=>{[523,659,784,1047].forEach((f,i)=>tn(d,{t:i*.09,dur:.2,f,type:'square',g:.08}));},
  perk:d=>{[392,523,659,784,1047].forEach((f,i)=>tn(d,{t:i*.06,dur:.22,f,type:'square',g:.07}));nz(d,{t:.25,dur:.3,f:6000,type:'highpass',g:.1});},
  perkOpen:d=>{tn(d,{dur:.3,f:220,f2:440,g:.1});tn(d,{t:.1,dur:.3,f:330,f2:660,g:.06});},
  buy:d=>{tn(d,{dur:.06,f:1318,type:'square',g:.08});tn(d,{t:.06,dur:.16,f:1760,type:'square',g:.08});nz(d,{dur:.12,f:6000,type:'highpass',g:.15});},
  deny:d=>{tn(d,{dur:.2,f:130,type:'square',g:.12});tn(d,{dur:.2,f:137,type:'square',g:.12});},
  tick:d=>{tn(d,{dur:.015,f:1400,type:'square',g:.025});},
  barrel:d=>{tn(d,{dur:.12,f:rand(380,460),type:'triangle',g:.14});nz(d,{dur:.04,f:2800,type:'bandpass',g:.18});},
  wood:d=>{nz(d,{dur:.05,f:1400,type:'bandpass',q:2,g:.25});tn(d,{dur:.04,f:rand(300,380),type:'triangle',g:.08});},
  metal:d=>{tn(d,{dur:.08,f:rand(1400,1900),type:'triangle',g:.08});nz(d,{dur:.03,f:3500,type:'bandpass',g:.15});},
  step:d=>{nz(d,{dur:.04,f:rand(300,500),g:.07});},
  alarm:d=>{tn(d,{dur:.12,f:880,type:'square',g:.05});tn(d,{t:.15,dur:.12,f:660,type:'square',g:.05});},
  down:d=>{tn(d,{dur:1.6,f:110,f2:30,type:'sawtooth',g:.25});nz(d,{dur:1.5,f:400,f2:60,g:.3});},
  win:d=>{[392,494,587,784,988,1175].forEach((f,i)=>tn(d,{t:i*.12,dur:.5,f,type:'square',g:.06}));},
};
export const GAP={flame:.06,spin:.05,hit:.035,marker:.03,tink:.03,shellTink:.04,groan:.45,coinDrop:.05,baseHit:.09,step:.1,barrel:.05,turret:.05,kill:.03,coin:.035,wood:.05,crit:.05,tick:.04,clang:.05,metal:.05,heal:.08,splat:.05,spit:.05,stomp:.06};
export function sfx(name,x,y,v=1){
  if(!AU.c||AU.muted)return;
  const now=AU.c.currentTime,gap=GAP[name];if(gap&&AU.last[name]&&now-AU.last[name]<gap)return;AU.last[name]=now;
  let pan=0,vol=v;
  if(x!==undefined&&G){const p=G.player,dx=x-p.x,dy=y-p.y;pan=clamp(dx/200,-.8,.8);vol*=clamp(1-Math.hypot(dx,dy)/430,0,1);if(vol<.02)return;}
  const fn=SND[name];if(fn)fn(bus(pan,vol));
}
export function setMute(m){AU.muted=m;if(AU.m)AU.m.gain.value=m?0:.55;try{localStorage.setItem('dernier-rempart-mute',m?'1':'0');}catch(e){}
  document.querySelectorAll('[data-sound]').forEach(b=>b.textContent=m?'Son : coupé':'Son : activé');}
