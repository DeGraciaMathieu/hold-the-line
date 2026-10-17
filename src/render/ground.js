import { BARRELS,BARREL_HP,BX,BY,LH,LW,WH,WW } from '../config.js';
import { BAYER,hash,mk,mulberry32,vnoise } from './pixel.js';
import { BALE,BIN,CARS,CRATE,LAMP,PINES,ROCKS,ROUNDS,SNOWPINES,SROCKS } from './sprites.js';
import { pick } from '../state/random.js';
import { clamp } from '../util.js';

/* =========================================================
   Campagne : quatre refuges
   ========================================================= */
export const roadY=(L,x)=>BY+46+(L.roadAmp?Math.sin(x/83)*L.roadAmp+Math.sin(x/31)*2:0);

/* =========================================================
   Sol : généré par refuge, tâché ensuite (sang, douilles, corps)
   ========================================================= */
export const[ground,gctx]=mk(WW,WH);
export const[groundClean,gcx]=mk(WW,WH);
export const[light,lctx]=mk(LW,LH);
export let groundLevel=-1;
export function zoneAt(L,x,y){
  const ex=(x-BX)/120,ey=(y-BY)/84;if(Math.sqrt(ex*ex+ey*ey)<1.02)return'clear';
  if(Math.abs(y-roadY(L,x))<13)return'road';
  if(L.vroads&&L.vroads.some(v=>Math.abs(x-v)<11))return'road';
  return'base';
}
export function genGround(L){
  const id=gctx.createImageData(WW,WH),d=id.data,T=L.ground,road=T.road==='clear'?T.clear:T.road;
  for(let y=0;y<WH;y++)for(let x=0;x<WW;x++){
    const t=BAYER[(y&3)*4+(x&3)],n=vnoise(x/38,y/38)*.65+vnoise(x/9,y/9)*.35;
    let pal=T.base,v=n*3.2+(t-.5)*.9,c=null;
    if(T.patch){const pn=vnoise(x/55+9,y/55+3)*.7+vnoise(x/14,y/14)*.3;if(pn+(t-.5)*.1>T.patch.th)pal=T.patch.pal;}
    const ex=(x-BX)/120,ey=(y-BY)/84,cd=Math.sqrt(ex*ex+ey*ey)+(vnoise(x/14+50,y/14)-.5)*.42;
    if(cd+(t-.5)*.12<1){pal=T.clear;v=n*3+(t-.5)*.8;}
    const ry=roadY(L,x),dy=Math.abs(y-ry);
    const rd=L.roadAmp?dy/12+(vnoise(x/10,y/10+30)-.5)*.35+(t-.5)*.12:dy/13;
    let vdx=99;if(L.vroads)for(const vx of L.vroads)vdx=Math.min(vdx,Math.abs(x-vx));
    if(rd<1||vdx<11){
      pal=road;v=n*2.4+(t-.5)*.7;
      if(T.ruts&&Math.abs(dy-5)<.9&&hash(x>>1,y)<.75)v-=1.5;
      if(T.marks){if(rd<1&&dy<.8&&((x>>3)&1))c=T.marks;if(vdx<.8&&((y>>3)&1))c=T.marks;if(!L.vroads&&Math.abs(dy-11)<.6)c=T.marks;}
    }else if(T.side&&((dy>=13&&dy<16)||(vdx>=11&&vdx<14)))c=T.side[(x+y)%7===0?1:0];
    if(!c)c=pal[clamp(Math.floor(v),0,3)];
    if(hash(x,y)<.012)c=T.speck[pal===T.base?0:1];
    const e=Math.min(x,y,WW-1-x,WH-1-y);
    if(e<50){const k=1-e/50;if(k*k*1.3+(t-.5)*.45>.35)c=[(c[0]+T.edge[0])>>1,(c[1]+T.edge[1])>>1,(c[2]+T.edge[2])>>1];if(k>.75&&t<(k-.7)*1.6)c=T.edge;}
    const o=(y*WW+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;
  }
  gctx.putImageData(id,0,0);
  const R=mulberry32(L.seed+5),F=(x,y,w,h,col)=>{gctx.fillStyle=col;gctx.fillRect(x,y,w,h);};
  const walk=(n,cols,zone)=>{for(let i=0;i<n;i++){let x=R()*WW|0,y=R()*WH|0;if(zone&&zoneAt(L,x,y)!==zone)continue;const len=4+R()*10|0;for(let s=0;s<len;s++){F(x,y,1,1,cols);x+=R()<.5?1:-1;y+=R()<.5?1:0;}}};
  const blot=(n,cols,zone,rmax)=>{for(let i=0;i<n;i++){const x=R()*WW,y=R()*WH;if(zone&&zoneAt(L,x,y)!==zone)continue;const r=2+R()*rmax;
    for(let k=0;k<r*r*2;k++){const a=R()*6.283,dd=Math.sqrt(R())*r;F(Math.round(x+Math.cos(a)*dd),Math.round(y+Math.sin(a)*dd*.6),1,1,cols[R()*cols.length|0]);}}};
  if(L.decor==='farm'){
    for(let i=0;i<900;i++){const x=R()*WW|0,y=R()*WH|0;if(zoneAt(L,x,y)!=='base')continue;const col=R()<.5?'#5f7f47':'#4c693b';F(x,y,1,1,col);F(x-1,y-1,1,1,col);F(x+1,y-1,1,1,col);}
    for(let i=0;i<80;i++){const x=R()*WW|0,y=R()*WH|0;if(zoneAt(L,x,y)!=='base')continue;F(x,y,1,1,R()<.6?'#d8cf8a':'#a8aed0');}
    for(let i=0;i<140;i++){const x=R()*WW|0,y=R()*WH|0;if(zoneAt(L,x,y)==='base')continue;F(x,y,R()<.3?2:1,1,R()<.5?'#8a7458':'#4a3c2c');}
  }else if(L.decor==='suburb'){
    for(let i=0;i<700;i++){const x=R()*WW|0,y=R()*WH|0;if(zoneAt(L,x,y)!=='base')continue;const col=R()<.5?'#6a9050':'#557a42';F(x,y,1,1,col);F(x-1,y-1,1,1,col);F(x+1,y-1,1,1,col);}
    walk(60,'#2c2d32','road');blot(14,['#26272c','#2e2f35','#1f2024'],'road',4);blot(8,['#4a4844','#58554f'],'clear',4);
    for(let i=0;i<40;i++){const x=R()*WW|0,y=R()*WH|0;if(zoneAt(L,x,y)!=='base')continue;F(x,y,1,1,pick(['#e0d070','#d86a6a','#e8e8f0']));}
  }else if(L.decor==='industry'){
    blot(30,['#3a3836','#2e2c2b','#44403c'],null,6);blot(22,['#7a5236','#6a4630','#8a5e3c'],null,4);walk(90,'#555355',null);
    for(let gx=BX-96;gx<=BX+96;gx+=24)for(let y=BY+20;y<BY+34;y++)if(y%3)F(gx,y,1,1,'#c8a03a');
    for(let x=0;x<WW;x++){const ry=Math.round(roadY(L,x));if((x>>2)%2){F(x,ry-13,1,1,'#d0a030');F(x,ry+13,1,1,'#d0a030');}}
  }else if(L.decor==='snow'){
    for(let i=0;i<70;i++){let x=R()*WW,y=R()*WH;const a=R()*6.283;for(let s=0;s<10;s++){F(Math.round(x),Math.round(y),2,1,'#a8b4c4');x+=Math.cos(a)*5;y+=Math.sin(a)*4+(s%2?2:-2);}}
    for(let i=0;i<300;i++)F(R()*WW|0,R()*WH|0,1,1,R()<.5?'#ffffff':'#b8c4d4');
  }
  gcx.clearRect(0,0,WW,WH);gcx.drawImage(ground,0,0);
}
export function stamp(x,y,col,s=1){gctx.fillStyle=col;gctx.fillRect(Math.round(x),Math.round(y),s,s);}

export function genProps(L){
  const R=mulberry32(L.seed),props=[];
  const free=(x,y,m)=>!props.some(o=>Math.hypot(o.x-x,o.y-y)<m);
  const nearBase=(x,y,k)=>Math.hypot((x-BX)/1.4,y-BY)<k;
  function scatter(n,o){let tries=0,c=0;while(c<n&&tries<5000){tries++;const x=16+R()*(WW-32),y=20+R()*(WH-30);
    if(nearBase(x,y,o.minBase||100))continue;
    if(o.edge){const e=Math.min(x,y,WW-x,WH-y);if(e>90&&R()<o.edge)continue;}
    const z=zoneAt(L,x,y);if(o.zone&&!o.zone.includes(z))continue;
    if(!free(x,y,o.space||14))continue;props.push(o.make(x,y));c++;}}
  const tree=spr=>(x,y)=>({kind:'tree',x,y,cols:[[0,0,3]],spr:spr[R()*spr.length|0],hit:'wood',tall:true});
  const rock=spr=>(x,y)=>({kind:'rock',x,y,cols:[[0,0,3.5]],spr:spr[R()*spr.length|0],hit:null});
  if(L.decor==='farm'){
    scatter(72,{minBase:150,edge:.78,zone:['base'],space:16,make:tree(PINES)});
    scatter(16,{minBase:95,zone:['base'],make:rock(ROCKS)});
    scatter(7,{minBase:96,zone:['base','clear'],space:24,make:(x,y)=>({kind:'bale',x,y,cols:[[0,-1,5]],spr:BALE,hit:'straw'})});
  }else if(L.decor==='suburb'){
    scatter(26,{minBase:140,zone:['base'],space:22,make:tree(ROUNDS)});
    for(let i=0;i<9;i++){let x,y,t=0;do{x=40+R()*(WW-80);y=roadY(L,x)+(R()<.5?-4:6);t++;}while((Math.abs(x-BX)<110||!free(x,y,40))&&t<80);
      if(t<80)props.push({kind:'car',x,y,cols:[[-7,-2,6],[7,-2,6]],spr:CARS[R()*CARS.length|0],hit:'metal'});}
    scatter(10,{minBase:110,zone:['base'],space:30,make:(x,y)=>({kind:'bin',x,y,cols:[[0,0,3]],spr:BIN,hit:'metal'})});
    for(let i=0;i<7;i++){const x=60+i*(WW-120)/6+R()*10;props.push({kind:'lamp',x,y:roadY(L,x)-17,cols:[[0,0,1.5]],spr:LAMP,hit:null,tall:true,light:true,flick:R()<.3});}
  }else if(L.decor==='industry'){
    scatter(28,{minBase:115,zone:['base','clear'],space:12,make:(x,y)=>({kind:'crate',x,y,cols:[[0,-2,6]],spr:CRATE,hit:'wood'})});
    scatter(3,{minBase:150,zone:['base'],space:40,make:(x,y)=>({kind:'car',x,y,cols:[[-7,-2,6],[7,-2,6]],spr:CARS[R()*CARS.length|0],hit:'metal'})});
    for(let i=0;i<5;i++){const x=80+i*(WW-160)/4;props.push({kind:'lamp',x,y:roadY(L,x)-17,cols:[[0,0,1.5]],spr:LAMP,hit:null,tall:true,light:true,flick:R()<.4});}
    scatter(8,{minBase:110,zone:['base'],space:20,make:(x,y)=>({kind:'barrel',x,y,cols:[[0,0,4]],hp:BARREL_HP,flash:0,dead:false,hit:'barrel'})});
  }else{
    scatter(86,{minBase:150,edge:.72,zone:['base'],space:15,make:tree(SNOWPINES)});
    scatter(20,{minBase:95,zone:['base'],make:rock(SROCKS)});
    scatter(5,{minBase:100,zone:['base','clear'],space:20,make:(x,y)=>({kind:'crate',x,y,cols:[[0,-2,6]],spr:CRATE,hit:'wood'})});
  }
  for(const b of BARRELS)props.push({kind:'barrel',x:b.x,y:b.y,cols:[[0,0,4]],hp:BARREL_HP,flash:0,dead:false,hit:'barrel',home:true});
  return props;
}

/* Génère le sol du refuge au premier passage, sinon restaure la copie propre. */
export function prepareGround(level,L){if(groundLevel!==level){genGround(L);groundLevel=level;}else gctx.drawImage(groundClean,0,0);}
