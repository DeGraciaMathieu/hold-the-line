import { BD,BHT,BW,ORDER,WEAP } from '../config.js';
import { ctx } from './dom.js';
import { mk,mulberry32,outline,shade,tint } from './pixel.js';

/* =========================================================
   Sprites (tous générés en pixels)
   ========================================================= */
export function humanoid(o,seed){
  const R=mulberry32(seed),out={frames:[],white:[],eyes:[],ax:o.ax,W:o.W,H:o.H};
  const stains=[];for(let i=0;i<(o.stains||0);i++)stains.push([Math.floor(R()*o.torsoW),Math.floor(R()*o.torsoH)]);
  const LEGS=[[0,0],[-1,1],[0,0],[1,-1],[1,-1]];
  for(let f=0;f<5;f++){
    const[c,x]=mk(o.W,o.H);const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
    const ax=o.ax,foot=o.H-2,L=LEGS[f],bob=(f===1||f===3)?-1:0,lean=f===4?1:0;
    const legTop=foot-o.legH+1;
    const tY=legTop-o.torsoH+bob,tX=ax-Math.floor(o.torsoW/2)+lean;
    if(o.zombie){const len=o.armLen+(f===4?2:0),sw=f%2;P(tX+o.torsoW-2,tY+1+sw,len+1,o.armT,o.skinD);}
    const leg=(lx,lift)=>{P(lx,legTop-lift,o.legW,o.legH-1,o.pants);P(lx,foot-lift,o.legW+1,1,o.boots);};
    leg(ax-o.legW+L[0],L[0]<0?1:0);
    leg(ax+1+L[1],L[1]<0?1:0);
    if(o.pack)P(tX-2,tY+1,2,Math.min(4,o.torsoH-1),o.pack);
    P(tX,tY,o.torsoW,o.torsoH,o.shirt);
    P(tX,tY,1,o.torsoH,shade(o.shirt,.7));
    P(tX,tY+o.torsoH-1,o.torsoW,1,shade(o.shirt,.7));
    P(tX+o.torsoW-1,tY,1,o.torsoH-1,shade(o.shirt,1.2));
    if(o.belt)P(tX,tY+o.torsoH-2,o.torsoW,1,o.belt);
    if(o.plates)for(let yy=tY+1;yy<tY+o.torsoH-1;yy+=3)P(tX+1,yy,o.torsoW-2,1,shade(o.shirt,1.35));
    for(const[sx,sy]of stains)P(tX+sx,tY+sy,1,1,'#5c1612');
    if(o.belly){
      const r=o.belly,cx=tX+o.torsoW-2,cy=tY+Math.floor(o.torsoH/2)+1;
      for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(xx*xx+yy*yy<=r*r+1){
        P(cx+xx,cy+yy,1,1,(xx+yy<-r*.4)?shade(o.skin,1.15):(xx+yy>r*.6?o.skinD:o.skin));}
      for(let k=0;k<Math.max(4,r);k++)P(cx+Math.round((R()-.5)*r*1.4),cy+Math.round((R()-.5)*r*1.4),1,1,o.pus);
    }
    const hX=ax-Math.floor(o.headW/2)+(o.headShift||0)+lean,hY=tY-o.headH+(o.neck||0);
    P(hX,hY,o.headW,o.headH,o.skin);
    P(hX,hY+o.headH-1,o.headW,1,o.skinD);
    P(hX,hY,o.headW,o.hairH||1,o.hair);
    P(hX,hY,2,o.headH-2,o.hair);
    if(o.visor)P(hX+2,hY+(o.hairH||1),o.headW-2,1,o.visor);
    const ex=hX+o.headW-2,ey=hY+(o.hairH||1)+1;
    P(ex,ey,1,1,o.eyeCol||'#240808');
    if(o.zombie)P(hX+o.headW-1,ey+2,1,1,o.mouth||'#3a0d0d');
    out.eyes.push([ex,ey]);
    if(o.zombie){
      const len=o.armLen+(f===4?2:0),sw=f%2,ay=tY+2+o.armT-sw;
      P(tX+o.torsoW-1,ay,len,o.armT,o.skin);
      P(tX+o.torsoW-1,ay,2,o.armT,shade(o.shirt,.85));
      P(tX+o.torsoW-1+len-1,ay,1,o.armT,o.skinD);
    }else{
      P(tX+o.torsoW-2,tY+1,2,3,shade(o.shirt,.8));
    }
    outline(c,'#0b090e');
    out.frames.push(c);out.white.push(tint(c,'#ffffff',1));
  }
  out.dark=tint(out.frames[0],'#1d0a08',.5);
  out.char=tint(out.frames[0],'#0d0806',.8);
  return out;
}
export const ZCFG={
  walker:{W:20,H:19,ax:7,legW:2,legH:4,torsoW:6,torsoH:6,headW:6,headH:5,headShift:1,hairH:1,armLen:5,armT:1,zombie:true,stains:3,
    skin:'#7f9e5c',skinD:'#5f7a44',hair:'#2b2a1f',pants:'#38394a',boots:'#1c1a18',shirts:['#55698a','#7a5a3a','#6c6c6c','#8a4848']},
  runner:{W:18,H:20,ax:7,legW:2,legH:5,torsoW:5,torsoH:5,headW:5,headH:5,headShift:1,hairH:2,armLen:4,armT:1,zombie:true,stains:2,
    skin:'#aab98c',skinD:'#83936a',hair:'#5a3a20',pants:'#2a2f3a',boots:'#151312',shirts:['#a03030','#c8b070','#2f6a7a']},
  brute:{W:30,H:27,ax:11,legW:3,legH:6,torsoW:12,torsoH:10,headW:7,headH:6,headShift:4,neck:3,hairH:1,armLen:8,armT:2,zombie:true,stains:7,
    skin:'#6c8a4e',skinD:'#4e6638',hair:'#1a1a14',pants:'#4a4030',boots:'#1a1612',shirts:['#3d4a2c','#4a3d2c']},
  bloater:{W:24,H:22,ax:9,legW:2,legH:4,torsoW:9,torsoH:9,belly:4,headW:6,headH:5,headShift:2,hairH:1,armLen:4,armT:1,zombie:true,stains:2,
    skin:'#a7af4a',skinD:'#7b8236',pus:'#e0dc78',hair:'#3a3a22',pants:'#3a3a2a',boots:'#1a1812',shirts:['#7a7a5a']},
  spitter:{W:18,H:20,ax:7,legW:2,legH:5,torsoW:5,torsoH:6,headW:6,headH:5,headShift:1,hairH:1,armLen:3,armT:1,zombie:true,stains:2,mouth:'#c8e050',
    skin:'#8fb06a',skinD:'#6a8a4a',hair:'#3a2a1a',pants:'#2f3340',boots:'#141212',shirts:['#5a7a3a','#6a5a7a']},
  armored:{W:22,H:21,ax:8,legW:2,legH:5,torsoW:8,torsoH:7,headW:6,headH:5,headShift:1,hairH:3,visor:'#6a8aa8',armLen:5,armT:2,zombie:true,stains:1,plates:true,
    skin:'#7a8f62',skinD:'#5a6e46',hair:'#1d2430',pants:'#1f2430',boots:'#0f1014',shirts:['#2e3a50']},
};
export const BCFG={
  butcher:{W:40,H:36,ax:14,legW:4,legH:8,torsoW:16,torsoH:13,headW:9,headH:7,headShift:5,neck:4,hairH:1,armLen:11,armT:3,zombie:true,stains:26,
    skin:'#9a7a6a',skinD:'#76584a',hair:'#2a1a14',pants:'#3a3036',boots:'#141012',shirts:['#d9d2c2']},
  matriarch:{W:40,H:34,ax:15,legW:3,legH:6,torsoW:14,torsoH:13,belly:8,headW:8,headH:6,headShift:3,neck:2,hairH:2,armLen:6,armT:2,zombie:true,stains:6,
    skin:'#b3b84e',skinD:'#848a36',pus:'#f0e080',hair:'#4a4a22',pants:'#3a3a2a',boots:'#1a1812',shirts:['#8a7a9a']},
  scrapper:{W:42,H:38,ax:15,legW:5,legH:8,torsoW:18,torsoH:14,headW:9,headH:8,headShift:5,neck:4,hairH:4,visor:'#e9b949',armLen:11,armT:4,zombie:true,stains:8,plates:true,
    skin:'#6c7a58',skinD:'#4e5a3e',hair:'#4a4e56',pants:'#3a3a42',boots:'#18181c',shirts:['#5a5e66']},
  titan:{W:46,H:42,ax:17,legW:5,legH:10,torsoW:20,torsoH:15,headW:10,headH:8,headShift:6,neck:4,hairH:2,armLen:12,armT:4,zombie:true,stains:16,
    skin:'#9fb2c0',skinD:'#7a8a98',hair:'#e8eef4',pants:'#2a3040',boots:'#101418',shirts:['#3a4a5a']},
};
export const SPR={};
export const SPRB={};
for(const k in ZCFG)SPR[k]=ZCFG[k].shirts.map((sh,i)=>humanoid({...ZCFG[k],shirt:sh},k.length*97+i*13));
for(const k in BCFG)SPRB[k]=humanoid({...BCFG[k],shirt:BCFG[k].shirts[0]},k.length*131);
export const PSPR=humanoid({W:16,H:19,ax:7,legW:2,legH:4,torsoW:6,torsoH:6,headW:6,headH:5,headShift:1,hairH:2,zombie:false,
  skin:'#e2a97c',skinD:'#b57a52',hair:'#a12c25',pants:'#2d3550',boots:'#18120e',shirt:'#d0782f',pack:'#4a3a26',belt:'#3a2a1a',eyeCol:'#1a1010'},5);

export function pine(seed,s,snow){
  const R=mulberry32(seed),w=Math.round(22*s),h=Math.round(34*s),[c,x]=mk(w,h),ax=Math.floor(w/2);
  const P=(a,b,ww,hh,col)=>{x.fillStyle=col;x.fillRect(a,b,ww,hh);};
  const tb=h-3;
  P(ax-1,tb-6,2,6,'#3b2a1d');P(ax-1,tb-6,1,6,'#2a1d14');
  const tiers=[[tb-5,20],[tb-11,16],[tb-17,12],[tb-23,8]].map(([y,ww])=>[Math.round(tb-(tb-y)*s),Math.round(ww*s)]);
  const tierH=Math.round(9*s);
  for(const[by,tw]of tiers){
    for(let r=0;r<tierH;r++){const yy=by-r;const ww=Math.max(1,Math.round(tw*(1-r/tierH)));const x0=ax-Math.floor(ww/2);
      for(let i=0;i<ww;i++){const left=i<ww*.45;let col=left?'#21422b':'#2f5c39';if(!left&&R()<.2)col='#42774a';if(left&&R()<.12)col='#183322';
        if(snow){if(r<2&&ww>2)col=left?'#c8d4e0':'#eef3f8';else if(!left&&R()<.22)col='#dfe8f0';else if(R()<.08)col='#b8c6d4';}
        P(x0+i,yy,1,1,col);}}
  }
  outline(c,'#060a07');
  return{img:c,ax};
}
export function roundTree(seed,s){
  const R=mulberry32(seed),w=Math.round(22*s),h=Math.round(30*s),[c,x]=mk(w,h),ax=w>>1;const P=(a,b,ww,hh,col)=>{x.fillStyle=col;x.fillRect(a,b,ww,hh);};
  const tb=h-3;P(ax-1,tb-8,2,8,'#4a3424');P(ax-1,tb-8,1,8,'#36261a');
  const r=Math.round(9*s),cy=tb-8-r+3;
  for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const dd=(xx*xx+yy*yy*1.15)/(r*r)+(R()-.5)*.18;if(dd<1){
    let col=(xx+yy<-r*.3)?'#4f7d47':(xx+yy>r*.4?'#223a22':'#3a6338');if(R()<.08)col='#5e9054';P(ax+xx,cy+yy,1,1,col);}}
  outline(c,'#070b07');return{img:c,ax};
}
export function rockSpr(seed,snow){
  const R=mulberry32(seed),[c,x]=mk(12,9);
  for(let y=0;y<9;y++)for(let i=0;i<12;i++){const dx=(i-5.5)/4.6,dy=(y-5)/3.2;if(dx*dx+dy*dy+(R()-.5)*.3<1){
    let col=(dx+dy<-.5)?'#717684':(dx+dy>.5?'#3c3f48':'#565b66');if(snow&&dy<-.25)col=dx<0?'#e8eef4':'#cdd8e2';x.fillStyle=col;x.fillRect(i,y,1,1);}}
  outline(c,'#08080b');return{img:c,ax:6};
}
export function barrelSpr(){
  const[c,x]=mk(10,12);const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  P(1,2,8,9,'#a12f27');P(1,2,2,9,'#7c211b');P(7,2,1,9,'#c4473a');P(1,4,8,1,'#5c1a14');P(1,8,8,1,'#5c1a14');
  P(1,1,8,2,'#c9533f');P(2,1,6,1,'#de6a52');P(4,5,2,2,'#e9b949');
  outline(c,'#0a0606');return{img:c,white:tint(c,'#fff',1),ax:5};
}
export function carSpr(seed){
  const R=mulberry32(seed),[c,x]=mk(30,19);const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  const body=['#7a2a24','#2a4a6a','#6a6a5a','#3a5a3a','#8a7a4a','#5a3a5a'][Math.floor(R()*6)],dk=shade(body,.68),lt=shade(body,1.22);
  P(2,8,26,7,body);P(2,8,26,1,lt);P(2,12,26,3,dk);
  P(7,3,15,6,lt);P(7,3,15,1,shade(body,1.4));
  P(8,5,13,3,'#24323e');P(8,5,13,1,'#3e5466');P(14,5,1,3,dk);
  if(R()<.7)P(9+Math.floor(R()*9),5,2,2,'#0e1418');
  P(4,14,5,3,'#121214');P(21,14,5,3,'#121214');P(5,15,2,1,'#3a3a3e');P(22,15,2,1,'#3a3a3e');
  P(27,10,1,2,'#e8d8a0');P(2,10,1,2,'#8a2a20');
  for(let k=0;k<12;k++)P(2+Math.floor(R()*26),3+Math.floor(R()*11),1,1,R()<.5?'#7a4a2a':'#5a3a22');
  outline(c,'#08080a');return{img:c,ax:15};
}
export function simpleSpr(w,h,ax,draw){const[c,x]=mk(w,h);const P=(a,b,ww,hh,col)=>{x.fillStyle=col;x.fillRect(a,b,ww,hh);};draw(P);outline(c,'#08080a');return{img:c,ax};}
export const BIN=simpleSpr(8,11,4,P=>{P(1,2,6,8,'#2f5a3a');P(1,2,1,8,'#22432a');P(6,2,1,8,'#3e7048');P(0,1,8,2,'#26482f');P(1,0,6,1,'#3e7048');P(2,5,4,1,'#22432a');});
export const LAMP=simpleSpr(9,28,4,P=>{P(4,4,1,22,'#3a3d44');P(3,25,3,2,'#2a2c32');P(4,3,4,1,'#3a3d44');P(6,3,3,2,'#55596a');P(7,5,1,1,'#fff6c8');});
export const CRATE=simpleSpr(13,13,6,P=>{P(0,0,13,4,'#a87e4c');P(0,0,13,1,'#c49860');P(0,4,13,9,'#7d5a34');P(0,7,13,1,'#5e4226');P(0,10,13,1,'#5e4226');P(1,4,1,9,'#5e4226');P(11,4,1,9,'#5e4226');P(0,1,1,3,'#8e6a3e');});
export const BALE=simpleSpr(14,11,7,P=>{P(0,3,14,8,'#c19a4e');P(0,3,14,1,'#d8b464');P(0,9,14,2,'#9a7638');P(1,0,12,3,'#d8b464');P(3,3,1,8,'#7a5a28');P(10,3,1,8,'#7a5a28');P(5,5,1,1,'#e8c87a');P(8,7,1,1,'#e8c87a');});
export function gunSpr(rects,muzzle){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const[x,y,w,h]of rects){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+w);y1=Math.max(y1,y+h);}
  const[c,x]=mk(x1-x0+2,y1-y0+2);
  for(const[rx,ry,w,h,col]of rects){x.fillStyle=col;x.fillRect(rx-x0+1,ry-y0+1,w,h);}
  outline(c,'#07070a');return{img:c,ox:-x0+1,oy:-y0+1,muzzle};
}

/* =========================================================
   Armes
   ========================================================= */
for(const id of ORDER){const w=WEAP[id];w.spr=gunSpr(w.rects,w.muzzle);w.icon=w.spr.img.toDataURL();w.pellets=w.pellets||1;}

export const BARREL=barrelSpr();
export const TBARREL=(()=>{const[c,x]=mk(9,3);x.fillStyle='#2a2d33';x.fillRect(0,0,7,2);x.fillStyle='#4a4f58';x.fillRect(0,0,7,1);x.fillStyle='#15161a';x.fillRect(7,0,2,2);return c;})();
export const PINES=[pine(11,1),pine(23,1.25),pine(37,.85),pine(51,1.1)];
export const SNOWPINES=[pine(13,1,true),pine(29,1.3,true),pine(41,.9,true),pine(57,1.12,true)];
export const ROUNDS=[roundTree(7,1),roundTree(19,1.2),roundTree(33,.9)];
export const ROCKS=[rockSpr(3),rockSpr(8),rockSpr(17)];
export const SROCKS=[rockSpr(5,true),rockSpr(12,true),rockSpr(21,true)];
export const CARS=[carSpr(1),carSpr(2),carSpr(3),carSpr(4),carSpr(5)];

/* Refuge : boîte 2.5D (toit visible + façade) */
export const BASE=(()=>{
  const R=mulberry32(77),[c,x]=mk(BW+2,BD+BHT+2);const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a+1,b+1,w,h);};
  for(let i=0;i<BW;i++)P(i,0,1,BD,(i%4<2)?'#535a65':'#474d57');
  P(0,0,BW,1,'#79818d');
  for(let k=0;k<46;k++)P(R()*BW|0,R()*(BD-4)|0,1,1,R()<.5?'#6e4a30':'#7d5638');
  P(27,6,10,7,'#3c4149');P(27,6,10,1,'#5f6671');P(28,8,8,1,'#2c3037');
  for(let i=0;i<BW;i+=6){P(i,BD-4,6,3,'#8c7c55');P(i,BD-4,6,1,'#a8976a');P(i+5,BD-4,1,3,'#6a5c3c');}
  for(let r=0;r<BHT;r++){const band=Math.floor(r/3);P(0,BD+r,BW,1,r%3===2?'#3f2b1d':(band%2?'#5e412b':'#6b4a31'));}
  for(let band=0;band<7;band++)for(let k=0;k<3;k++)P(R()*BW|0,BD+band*3,1,2,'#3f2b1d');
  P(27,BD+4,10,BHT-4,'#24180f');P(27,BD+4,10,1,'#3f2b1d');P(36,BD+5,1,BHT-6,'#f2c55c');
  for(const wx of[8,48]){P(wx,BD+5,8,5,'#f2c55c');P(wx,BD+5,8,1,'#c8962e');P(wx+3,BD+5,1,5,'#3f2b1d');P(wx,BD+7,8,1,'#3f2b1d');}
  P(31,BD+1,2,2,'#fff2b0');
  for(let i=0;i<BW;i+=6){if(i>=24&&i<=36)continue;P(i,BD+BHT-5,6,4,'#8c7c55');P(i,BD+BHT-5,6,1,'#a8976a');P(i+5,BD+BHT-5,1,4,'#6a5c3c');P(i,BD+BHT-2,6,1,'#6a5c3c');}
  outline(c,'#07060a');
  const dmg=[];const D=mulberry32(5);
  for(const t of[.9,.82,.74,.66,.58,.5,.42,.34,.26,.18,.1]){
    const front=D()<.65,cx=4+(D()*56|0),cy=front?BD+2+(D()*12|0):2+(D()*18|0),px=[];
    if(t<.55&&D()<.65){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)px.push([cx+a,cy+b,'#090605']);px.push([cx-2,cy,'#9a7650'],[cx+2,cy-1,'#9a7650'],[cx,cy+2,'#9a7650']);}
    else{let a=cx,b=cy;for(let s=0;s<7;s++){px.push([a,b,'#1d130c']);a+=D()<.5?1:-1;b+=D()<.6?1:0;}}
    dmg.push({t,px});
  }
  const snowCap=[];const S=mulberry32(9);
  for(let i=0;i<BW;i++){const h=1+Math.floor(S()*2.5);for(let y=0;y<h;y++)snowCap.push([i,y,y===0?'#f2f6fa':'#d6e0ea']);}
  for(let k=0;k<70;k++)snowCap.push([Math.floor(S()*BW),2+Math.floor(S()*(BD-6)),S()<.5?'#e6edf4':'#c8d4e0']);
  return{img:c,white:tint(c,'#fff',1),dmg,snowCap};
})();

/* Police bitmap 3×5 pour les chiffres en jeu */
export const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111',
  '6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','$':'011110111011110','x':'000101010101000','!':'010010010000010','-':'000000111000000'};
export function drawText(s,x,y,col,sc=1){
  const tw=s.length*4*sc-sc;x=Math.round(x-tw/2);y=Math.round(y);
  for(let pass=0;pass<2;pass++){ctx.fillStyle=pass?col:'#000';const o=pass?0:sc;
    for(let i=0;i<s.length;i++){const g=FONT[s[i]];if(!g)continue;for(let k=0;k<15;k++)if(g[k]==='1')ctx.fillRect(x+i*4*sc+(k%3)*sc+o,y+((k/3)|0)*sc+o,sc,sc);}}
}
