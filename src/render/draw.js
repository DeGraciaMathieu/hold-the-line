import { BD,BHT,BW,BX,GH,H,LH,LW,PLAYER_LOW_HP,W,WEAP,WH,WW } from '../config.js';
import { muzzlePos } from '../rules/weapons.js';
import { ctx } from './dom.js';
import { ground,lctx,light } from './ground.js';
import { mk } from './pixel.js';
import { BARREL,BASE,PSPR,TBARREL,drawText } from './sprites.js';
import { CX,CY,G,cam,levelOf,mouse,paused,setCamera } from '../state/game.js';
import { rand } from '../state/random.js';
import { clamp } from '../util.js';

export const[VIG,vgx]=mk(W,H);
export const[RED,rdx]=mk(W,H);
(()=>{let g=vgx.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,W*.62);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.34)');vgx.fillStyle=g;vgx.fillRect(0,0,W,H);
  g=rdx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.6);g.addColorStop(0,'rgba(160,0,0,0)');g.addColorStop(1,'rgba(190,10,10,.8)');rdx.fillStyle=g;rdx.fillRect(0,0,W,H);})();

/* =========================================================
   Rendu
   ========================================================= */
export const SHC={};
export function shadowImg(rx){rx=Math.max(1,Math.round(rx));if(SHC[rx])return SHC[rx];const ry=Math.max(1,Math.round(rx*.45)),[c,x]=mk(rx*2+1,ry*2+1);
  x.fillStyle='rgba(0,0,0,.42)';for(let yy=-ry;yy<=ry;yy++)for(let xx=-rx;xx<=rx;xx++)if(xx*xx/(rx*rx)+yy*yy/(ry*ry)<=1)x.fillRect(xx+rx,yy+ry,1,1);
  return SHC[rx]={c,rx,ry};}
export function shadow(x,y,rx){const s=shadowImg(rx);ctx.drawImage(s.c,Math.round(x-CX-s.rx),Math.round(y-CY-s.ry));}
export function drawSpr(img,ax,x,y,flip,sx=1,sy=1){
  const w=Math.round(img.width*sx),h=Math.round(img.height*sy),a=Math.round(ax*sx),top=Math.round(y)-h+2;x=Math.round(x);
  if(!flip)ctx.drawImage(img,x-a,top,w,h);
  else{ctx.save();ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(img,-a-1,top,w,h);ctx.restore();}
}
export function pline(x0,y0,x1,y1,col,dither){
  const dx=x1-x0,dy=y1-y0,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));ctx.fillStyle=col;
  for(let i=0;i<=n;i++){if(dither&&((i+dither)%2))continue;ctx.fillRect(Math.round(x0+dx*i/n),Math.round(y0+dy*i/n),1,1);}
}
export function fillEllipse(x,y,rx,ry){x=Math.round(x);y=Math.round(y);for(let yy=-Math.round(ry);yy<=ry;yy++){const h=Math.round(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));ctx.fillRect(x-h,y+yy,h*2+1,1);}}
export function ringPx(x,y,r,col,skip){ctx.fillStyle=col;const n=Math.max(12,r*4);for(let i=0;i<n;i++){if(skip&&i%skip)continue;const a=i/n*6.283;ctx.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.6),1,1);}}

export function drawZombie(z){
  const S=z.S,fr=z.atkAnim>0?4:Math.floor(z.anim)%4;z.fr=fr;
  const img=z.flash>0?S.white[fr]:S.frames[fr];
  let sx=1,sy=1;if(z.squash>0){const k=z.squash/.1;sx=1+.28*k;sy=1-.2*k;}
  drawSpr(img,S.ax,z.x-CX,z.y-CY,z.face<0,sx,sy);
  if((z.type==='brute'||z.type==='armored')&&z.hp<z.max){const w=z.type==='brute'?16:10,x=Math.round(z.x-CX-w/2),y=Math.round(z.y-CY-S.H-1);ctx.fillStyle='#000';ctx.fillRect(x-1,y-1,w+2,3);ctx.fillStyle=z.type==='brute'?'#d6392b':'#9aa4b4';ctx.fillRect(x,y,Math.round(w*z.hp/z.max),1);}
}
export function drawTelegraphs(){
  for(const z of G.zombies){
    if(!z.boss)continue;const x=z.x-CX,y=z.y-CY,bl=Math.floor(G.time*14)%2;
    if(z.state==='tele'){const c=bl?'#ff3b2b':'#8a1a14';const L=200*(1-Math.max(0,z.stT)/.85*.4);
      pline(x+z.cdx*10,y+z.cdy*10,x+z.cdx*L,y+z.cdy*L,c,1);pline(x+z.cdx*10-z.cdy*3,y+z.cdy*10+z.cdx*3,x+z.cdx*L-z.cdy*3,y+z.cdy*L+z.cdx*3,c,2);pline(x+z.cdx*10+z.cdy*3,y+z.cdy*10-z.cdx*3,x+z.cdx*L+z.cdy*3,y+z.cdy*L-z.cdx*3,c,2);}
    if(z.state==='stomp'){const k=1-Math.max(0,z.stT)/.6;ringPx(x,y,58,'#8a1a14',2);ringPx(x,y,8+50*k,bl?'#ff3b2b':'#ff8a6a');}
  }
}
export function drawPlayer(){
  const p=G.player;if(p.dead)return;
  if(p.inv>0&&Math.floor(p.inv*22)%2)return;
  const fr=p.moving?Math.floor(p.anim)%4:0,up=Math.sin(p.ang)<-.35&&!G.over;
  if(up)drawGun();
  drawSpr(PSPR.frames[fr],PSPR.ax,p.x-CX,p.y-CY,p.face<0);
  if(!up)drawGun();
}
export function drawGun(){
  const p=G.player,w=WEAP[p.w],g=w.spr;
  const hx=Math.round(p.x+p.face*2-CX),hy=Math.round(p.y-GH-CY);
  let ang=p.ang;
  if(p.swap>0)ang+=p.face*(p.swap/.26)*1.3;
  if(p.meleeAnim>0){const k=1-p.meleeAnim/.18;ang+=p.face*(-1.3+2.6*k);}
  if(p.reload>0&&!w.perShell){const k=1-p.reload/p.reloadMax;ang+=p.face*Math.sin(k*Math.PI)*.7;}
  if(p.reload>0&&w.perShell)ang+=p.face*.25;
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);if(p.face<0)ctx.scale(1,-1);
  ctx.drawImage(g.img,-g.ox-Math.round(p.kick),-g.oy);
  const kk=Math.round(p.kick);
  if(w.spin&&p.spin>0){const ph=Math.floor(G.time*60*p.spin)%2;ctx.fillStyle=ph?'#6d727c':'#2a2c32';ctx.fillRect(5-kk,-4,13,1);ctx.fillStyle=ph?'#2a2c32':'#6d727c';ctx.fillRect(5-kk,-3,13,1);}
  if(w.charge&&p.charging>0){ctx.fillStyle=Math.random()<.5?'#bff6ff':'#5fe0ff';ctx.fillRect(3-kk,-3,14,1);}
  ctx.restore();
}
export function drawBase(){
  const b=G.base,ox=b.shake>0?Math.round(rand(-1.5,1.5)):0;
  const x=b.x0-1-CX+ox,y=b.y1-(BD+BHT)-1-CY;
  ctx.drawImage(BASE.img,x,y);
  if(levelOf().snow)for(const[px,py,col]of BASE.snowCap){ctx.fillStyle=col;ctx.fillRect(x+1+px,y+1+py,1,1);}
  const r=b.hp/b.maxHp;
  for(const m of BASE.dmg)if(r<m.t)for(const[px,py,col]of m.px){ctx.fillStyle=col;ctx.fillRect(x+1+px,y+1+py,1,1);}
  if(b.flash>0){ctx.globalAlpha=.55;ctx.drawImage(BASE.white,x,y);ctx.globalAlpha=1;}
  for(const t of G.turrets){
    const tx=Math.round(t.x-CX+ox),ty=Math.round(t.y-b.h-CY-3);
    ctx.fillStyle='#0b0b0e';ctx.fillRect(tx-4,ty-1,9,6);ctx.fillStyle='#3a3f48';ctx.fillRect(tx-3,ty,7,4);ctx.fillStyle='#5b616c';ctx.fillRect(tx-3,ty,7,1);
    ctx.save();ctx.translate(tx,ty+1);ctx.rotate(t.ang);ctx.drawImage(TBARREL,-1,-1);ctx.restore();
    ctx.fillStyle=t.flash>0?'#ffe08a':'#c0392b';ctx.fillRect(tx,ty+2,1,1);
  }
}
export function drawProp(o){
  const x=o.x-CX,y=o.y-CY;if(x<-30||x>W+30||y<-4||y>H+50)return;
  if(o.kind==='barrel'){if(o.dead)return;drawSpr(o.flash>0?BARREL.white:BARREL.img,BARREL.ax,x,y,false);return;}
  const s=o.spr,p=G.player;
  let alpha=1;
  if(o.tall&&!p.dead&&p.y<o.y&&p.y>o.y-s.img.height+4&&Math.abs(p.x-o.x)<s.img.width/2)alpha=.45;
  if(alpha<1)ctx.globalAlpha=alpha;
  drawSpr(s.img,s.ax,x,y,false);
  ctx.globalAlpha=1;
}
export function drawCoin(c){
  const x=Math.round(c.x-CX),y=Math.round(c.y-c.z-CY)-3,f=[3,2,1,2][Math.floor(G.time*10+c.seed)%4];
  ctx.fillStyle='#3a2a08';ctx.fillRect(x-Math.floor(f/2)-1,y-1,f+2,5);
  ctx.fillStyle='#e9b949';ctx.fillRect(x-Math.floor(f/2),y,f,3);
  ctx.fillStyle='#fff3b8';ctx.fillRect(x-Math.floor(f/2),y,1,1);
}
export function drawGrenade(g){
  const x=Math.round(g.x-CX),y=Math.round(g.y-g.z-CY);
  ctx.fillStyle='#0b0b0b';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#55603a';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#8a9a5a';ctx.fillRect(x-1,y-1,1,1);
}
export const EMI={spark:1,fire:1,goo:1,flash:1,boomflash:1,ring:1,beam:1,slash:1,rail:1};
export function drawParts(em){
  for(const q of G.parts){
    if(!!EMI[q.type]!==em)continue;
    const x=Math.round(q.x-CX),y=Math.round(q.y-q.z-CY);
    if(q.type!=='beam'&&q.type!=='rail'&&(x<-60||x>W+60||y<-60||y>H+60))continue;
    const k=q.life/q.max;
    switch(q.type){
      case'blood':case'goo':ctx.fillStyle=q.col;ctx.fillRect(x,y,q.s||1,q.s||1);break;
      case'gib':ctx.fillStyle=q.col;ctx.fillRect(x,y,2,2);ctx.fillStyle=q.col2;ctx.fillRect(x,y,1,1);break;
      case'casing':ctx.fillStyle=q.col;if((q.spin|0)%2)ctx.fillRect(x,y,2,1);else ctx.fillRect(x,y,1,2);break;
      case'shell':ctx.fillStyle='#b8302a';if((q.spin|0)%2){ctx.fillRect(x,y,3,2);ctx.fillStyle='#e2b24a';ctx.fillRect(x+2,y,1,2);}else{ctx.fillRect(x,y,2,3);ctx.fillStyle='#e2b24a';ctx.fillRect(x,y+2,2,1);}break;
      case'chip':ctx.fillStyle=q.col;ctx.fillRect(x,y,q.s||1,q.s||1);break;
      case'mag':ctx.fillStyle=q.col;ctx.fillRect(x,y,2,3);break;
      case'smoke':case'dust':{ctx.globalAlpha=q.alpha*k;ctx.fillStyle=q.col;const s=Math.max(1,Math.round(q.size));ctx.fillRect(x-(s>>1),y-(s>>1),s,s);ctx.globalAlpha=1;break;}
      case'spark':ctx.fillStyle=q.col;ctx.fillRect(x,y,1,1);if(q.px!==undefined){ctx.globalAlpha=.5;ctx.fillRect(Math.round(q.px-CX),Math.round(q.py-CY),1,1);ctx.globalAlpha=1;}break;
      case'fire':{ctx.fillStyle=k>.7?'#fff1a8':k>.45?'#ffb340':k>.25?'#e4521f':'#5a2a1a';const s=k>.4?(q.s||2):1;ctx.fillRect(x,y,s,s);break;}
      case'flash':{const c=Math.cos(q.a),s=Math.sin(q.a),L=q.L*(k>.5?1:.6);
        ctx.fillStyle='#ff8a1e';for(let i=0;i<=L;i++)ctx.fillRect(Math.round(x+c*i)-1,Math.round(y+s*i)-1,i<L*.7?3:2,i<L*.7?3:2);
        const m=L*.35,ps=-s,pc=c;for(const sg of[-1,1])for(let j=1;j<=(q.big?4:2);j++)ctx.fillRect(Math.round(x+c*m+ps*j*sg),Math.round(y+s*m+pc*j*sg),1,1);
        ctx.fillStyle='#fff7d2';for(let i=0;i<=L*.65;i++)ctx.fillRect(Math.round(x+c*i),Math.round(y+s*i),2,1);break;}
      case'boomflash':ctx.fillStyle=q.acid?'#eaff9c':'#fff6d0';fillEllipse(x,y,q.r*(.6+.4*k),q.r*.6*(.6+.4*k));ctx.fillStyle=q.acid?'#c8e050':'#ffd060';fillEllipse(x,y-q.r*.2,q.r*.5,q.r*.35);break;
      case'ring':ringPx(x,y,q.R*(1-k*k),q.blood?'#d03a2a':q.acid?'#c8e050':'#ffe6a8',k<.4?2:0);break;
      case'beam':pline(q.x-CX,q.y-CY,q.x2-CX,q.y2-CY,k>.6?'#fff6d8':'#b8b2a0',k>.6?0:(Math.floor(G.time*30)%2)+1);break;
      case'slash':ctx.fillStyle='#ffffff';ctx.fillRect(x,y,2,1);break;
      case'rail':{const dx=q.x2-q.x,dy=q.y2-q.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,x0=q.x-CX,y0=q.y-CY,x1=q.x2-CX,y1=q.y2-CY;
        if(k>.7){pline(x0+nx*2,y0+ny*2,x1+nx*2,y1+ny*2,'#2a8aaa',1);pline(x0-nx*2,y0-ny*2,x1-nx*2,y1-ny*2,'#2a8aaa',2);}
        if(k>.35){pline(x0+nx,y0+ny,x1+nx,y1+ny,'#5fe0ff');pline(x0-nx,y0-ny,x1-nx,y1-ny,'#5fe0ff');}
        pline(x0,y0,x1,y1,k>.5?'#ffffff':'#9ff0ff',k>.5?0:(Math.floor(G.time*30)%2)+1);break;}
    }
  }
}
export function glow(x,y,r,a,sq){
  const sx=(x-CX)/2,sy=(y-CY)/2,sr=r/2;if(sx+sr<0||sx-sr>LW||sy+sr*sq<0||sy-sr*sq>LH)return;
  lctx.save();lctx.translate(sx,sy);lctx.scale(1,sq);
  const g=lctx.createRadialGradient(0,0,0,0,0,sr);
  g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.42,`rgba(0,0,0,${a*.85})`);g.addColorStop(.43,`rgba(0,0,0,${a*.6})`);
  g.addColorStop(.7,`rgba(0,0,0,${a*.34})`);g.addColorStop(.71,`rgba(0,0,0,${a*.16})`);g.addColorStop(1,'rgba(0,0,0,0)');
  lctx.fillStyle=g;lctx.beginPath();lctx.arc(0,0,sr,0,6.283);lctx.fill();lctx.restore();
}
export function lightPass(){
  const b=G.base,p=G.player,r=b.hp/b.maxHp,L=levelOf();
  lctx.globalCompositeOperation='source-over';lctx.clearRect(0,0,LW,LH);
  lctx.fillStyle=L.dark;lctx.fillRect(0,0,LW,LH);
  lctx.globalCompositeOperation='destination-out';
  const fl=r<.3&&Math.random()<.08?.35:1;
  glow(BX,b.y1-b.h+3,150,.95*fl,.62);
  glow(b.x0+12,b.y1-b.h+8,64,.8*fl,.7);glow(b.x1-12,b.y1-b.h+8,64,.8*fl,.7);
  if(r<.25)glow(BX+rand(-10,10),b.y0-b.h+6,90,.6+Math.random()*.2,.7);
  for(const o of G.props)if(o.light){o.on=!(o.flick&&Math.random()<.06);if(o.on)glow(o.x+3,o.y-19,120,.85,.6);}
  if(!p.dead){
    glow(p.x,p.y-6,74,.85,.72);
    if(G.state!=='title'){
      const sx=(p.x-CX)/2,sy=(p.y-GH-CY)/2,len=90,half=.42,a=.85*(Math.random()<.02?.7:1);
      lctx.save();lctx.translate(sx,sy);lctx.rotate(p.ang);
      const g=lctx.createRadialGradient(0,0,2,0,0,len);
      g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.55,`rgba(0,0,0,${a*.8})`);g.addColorStop(.56,`rgba(0,0,0,${a*.5})`);g.addColorStop(.85,`rgba(0,0,0,${a*.25})`);g.addColorStop(1,'rgba(0,0,0,0)');
      lctx.fillStyle=g;lctx.beginPath();lctx.moveTo(0,0);lctx.arc(0,0,len,-half,half);lctx.closePath();lctx.fill();lctx.restore();
    }
  }
  for(const l of G.lights)glow(l.x,l.y,l.r,l.a*(l.life/l.max),.7);
  lctx.globalCompositeOperation='source-over';
  ctx.drawImage(light,0,0,W,H);
  ctx.globalCompositeOperation='lighter';
  for(const l of G.lights){if(!l.col)continue;const k=l.life/l.max,x=l.x-CX,y=l.y-CY,rr=l.r*.45;if(x<-rr||x>W+rr||y<-rr||y>H+rr)continue;
    const g=ctx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,l.col==='acid'?`rgba(150,200,40,${.4*k})`:l.col==='rail'?`rgba(90,220,255,${.45*k})`:`rgba(255,150,60,${.4*k})`);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(x-rr,y-rr,rr*2,rr*2);}
  for(const o of G.props)if(o.light&&o.on){const x=o.x+3-CX,y=o.y-19-CY;if(x<-40||x>W+40||y<-40||y>H+40)continue;
    const g=ctx.createRadialGradient(x,y,0,x,y,26);g.addColorStop(0,'rgba(255,200,120,.22)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-26,y-26,52,52);}
  ctx.globalCompositeOperation='source-over';
}
export function drawEmissive(){
  const b=G.base,bx=b.x0-1-CX,by=b.y1-(BD+BHT)-1-CY,r=b.hp/b.maxHp,on=!(r<.3&&Math.random()<.08);
  if(on){ctx.fillStyle='#f6cf68';for(const wx of[8,48]){ctx.fillRect(bx+1+wx,by+1+BD+6,3,1);ctx.fillRect(bx+1+wx+4,by+1+BD+6,4,1);ctx.fillRect(bx+1+wx,by+1+BD+8,3,2);ctx.fillRect(bx+1+wx+4,by+1+BD+8,4,2);}
    ctx.fillStyle='#fff6c8';ctx.fillRect(bx+32,by+BD+2,2,2);ctx.fillStyle='#f2c55c';ctx.fillRect(bx+37,by+BD+6,1,BHT-7);}
  for(const o of G.props)if(o.light&&o.on){const x=Math.round(o.x-CX)-o.spr.ax+7,y=Math.round(o.y-CY)-o.spr.img.height+2+5;ctx.fillStyle='#fff6c8';ctx.fillRect(x,y,1,1);ctx.fillStyle='#ffd88a';ctx.fillRect(x-1,y+1,3,1);}
  for(const bl of G.bullets){
    const x1=bl.x-CX,y1=bl.y-bl.z-CY,tl=bl.src==='sniper'?.03:.022,x0=x1-bl.vx*tl,y0=y1-bl.vy*tl;
    if(x1<-20||x1>W+20||y1<-20||y1>H+20)continue;
    pline(x0,y0,x1,y1,bl.src==='turret'?'#ff9a4a':'#e9a83a');
    ctx.fillStyle='#fff8d8';ctx.fillRect(Math.round(x1),Math.round(y1),1,1);ctx.fillRect(Math.round(x1-bl.vx*.004),Math.round(y1-bl.vy*.004),1,1);
  }
  for(const f of G.flames){const k=f.life/f.max,x=Math.round(f.x-CX),y=Math.round(f.y-f.z-CY),s=1+Math.round((1-k)*3);
    ctx.fillStyle=k>.78?'#fff3b0':k>.52?'#ffc040':k>.3?'#ff6a1a':'#9a2c14';ctx.fillRect(x-(s>>1),y-(s>>1),s,s);}
  for(const g of G.globs){const x=Math.round(g.x-CX),y=Math.round(g.y-g.z-CY);ctx.fillStyle='#2a3a0a';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#b8d848';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#f0ff9a';ctx.fillRect(x-1,y-1,1,1);}
  const pl=G.player;
  if(!pl.dead&&G.state==='play'&&!G.over){const w=WEAP[pl.w];
    if(w.flame&&pl.swap<=0){const[mx,my]=muzzlePos(pl,w);ctx.fillStyle=Math.random()<.5?'#5fa8ff':'#ffb040';ctx.fillRect(Math.round(mx-CX),Math.round(my-CY),1,1);}
    if(w.charge&&pl.charging>0){const[mx,my]=muzzlePos(pl,w),c=Math.cos(pl.ang),s=Math.sin(pl.ang),k=1-pl.charging/w.charge;
      ctx.fillStyle='#5fe0ff';for(let i=6;i<260;i+=3){if(Math.random()>k)continue;ctx.fillRect(Math.round(mx+c*i-CX),Math.round(my+s*i-CY),1,1);}
      const r=1+Math.round(k*3);ctx.fillStyle='#e8fdff';ctx.fillRect(Math.round(mx-CX-r/2),Math.round(my-CY-r/2),r,r);}
  }
  drawParts(true);
  for(const z of G.zombies){if(z.flash>0)continue;const S=z.S,x=Math.round(z.x-CX),y=Math.round(z.y-CY);if(x<-30||x>W+30||y<-10||y>H+50)continue;
    const[ex,ey]=S.eyes[z.fr||0],sx=z.face<0?x+S.ax-ex:x-S.ax+ex,top=y-S.H+2;
    ctx.fillStyle=z.type==='armored'?'#7fd8f0':z.type==='spitter'?'#d8ff5a':'#ff4b33';ctx.fillRect(sx,top+ey,z.boss?2:1,1);}
  for(const c of G.coins)if(Math.floor(G.time*6+c.seed)%5===0){ctx.fillStyle='#fff6c0';ctx.fillRect(Math.round(c.x-CX)-1,Math.round(c.y-c.z-CY)-3,1,1);}
}
export function drawCross(){
  if(G.state!=='play'||paused||G.over)return;
  const p=G.player,w=WEAP[p.w],x=Math.round(mouse.sx),y=Math.round(mouse.sy);
  const gap=Math.round(3+(w.spread+p.bloom)*50+(p.moving?2:0)+(p.kick>1?1:0));
  const col=G.dry>0?'#d6392b':'#f1ead6';
  const R=[[x-gap-3,y,3,1],[x+gap+1,y,3,1],[x,y-gap-3,1,3],[x,y+gap+1,1,3],[x,y,1,1]];
  ctx.fillStyle='#000';for(const[a,b,c,d]of R)ctx.fillRect(a-1,b-1,c+2,d+2);
  ctx.fillStyle=col;for(const[a,b,c,d]of R)ctx.fillRect(a,b,c,d);
  if(G.hitMark>0){
    const c=G.killMark>0?'#ff3b2b':'#ffffff',d=gap+(G.killMark>0?3:2);
    for(let i=0;i<3;i++){for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){ctx.fillStyle='#000';ctx.fillRect(x+sx*(d+i)-1,y+sy*(d+i),1,1);ctx.fillStyle=c;ctx.fillRect(x+sx*(d+i),y+sy*(d+i),1,1);}}
  }
  if(p.reload>0){const f=1-p.reload/p.reloadMax;ctx.fillStyle='#000';ctx.fillRect(x-8,y+gap+6,17,3);ctx.fillStyle='#e9b949';ctx.fillRect(x-7,y+gap+7,Math.round(15*f),1);}
  if(w.spin&&p.spin>0&&p.spin<1){ctx.fillStyle='#000';ctx.fillRect(x-8,y-gap-9,17,3);ctx.fillStyle='#7fd8f0';ctx.fillRect(x-7,y-gap-8,Math.round(15*p.spin),1);}
}
export function drawAlert(){
  const b=G.base;if(G.state!=='play'||G.over)return;
  const arrow=(tx,ty,col)=>{if(tx>0&&tx<W&&ty>0&&ty<H)return;if(Math.floor(G.time*8)%2)return;
    const x=clamp(tx,10,W-10),y=clamp(ty,12,H-14);ctx.fillStyle='#000';ctx.fillRect(x-6,y-6,13,13);ctx.fillStyle=col;ctx.fillRect(x-5,y-5,11,11);drawText('!',x+1,y-3,'#ffffff',1);};
  if(b.alert>0)arrow(BX-CX,b.y-CY-10,'#d6392b');
  const bz=G.bossRef;if(bz&&!bz.dead)arrow(bz.x-CX,bz.y-CY-12,'#8a1a14');
}
export function render(dt){
  const p=G.player;
  const look=G.state==='play'&&!G.over?.22:0;
  const tx=p.x-W/2+(mouse.sx-W/2)*look,ty=p.y-H/2-6+(mouse.sy-H/2)*look,k=1-Math.exp(-dt*7);
  cam.x=clamp(cam.x+(tx-cam.x)*k,0,WW-W);cam.y=clamp(cam.y+(ty-cam.y)*k,0,WH-H);
  G.ckx*=Math.exp(-dt*12);G.cky*=Math.exp(-dt*12);
  const tr=G.trauma*G.trauma;
  setCamera(Math.round(cam.x+G.ckx+(Math.random()*2-1)*tr*8),Math.round(cam.y+G.cky+(Math.random()*2-1)*tr*8));
  G.hitMark-=dt;G.killMark-=dt;

  ctx.fillStyle='#050608';ctx.fillRect(0,0,W,H);
  ctx.drawImage(ground,-CX,-CY);

  const b=G.base;ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(b.x0-CX+2,b.y1-CY,BW,3);ctx.fillRect(b.x1-CX,b.y0-CY+3,3,BD);
  for(const o of G.props){if(o.dead)continue;
    if(o.kind==='tree')shadow(o.x+3,o.y,o.spr.img.width*.32);else if(o.kind==='car')shadow(o.x,o.y,13);else if(o.kind==='crate'||o.kind==='bale')shadow(o.x,o.y,7);else shadow(o.x,o.y,4);}
  for(const z of G.zombies)shadow(z.x,z.y,z.t.r+1.5);
  if(!p.dead)shadow(p.x,p.y,5);
  for(const c of G.coins)shadow(c.x,c.y,2);
  for(const g of G.grenades)shadow(g.x,g.y,2);
  for(const g of G.globs)shadow(g.x,g.y,2);
  ctx.fillStyle='rgba(0,0,0,.35)';
  for(const bl of G.bullets)ctx.fillRect(Math.round(bl.x-CX),Math.round(bl.y-CY),1,1);
  for(const q of G.parts)if(q.z>1&&(q.type==='gib'||q.type==='casing'||q.type==='shell'||q.type==='chip'))ctx.fillRect(Math.round(q.x-CX),Math.round(q.y-CY),1,1);
  drawTelegraphs();

  const Ls=[];
  for(const o of G.props)if(!o.dead)Ls.push([o.y,0,o]);
  Ls.push([b.y1,1,b]);
  for(const z of G.zombies)Ls.push([z.y,2,z]);
  if(!p.dead)Ls.push([p.y,3,p]);
  for(const c of G.coins)Ls.push([c.y,4,c]);
  for(const g of G.grenades)Ls.push([g.y,5,g]);
  Ls.sort((a,c)=>a[0]-c[0]);
  for(const[,kd,o]of Ls){if(kd===0)drawProp(o);else if(kd===1)drawBase();else if(kd===2)drawZombie(o);else if(kd===3)drawPlayer();else if(kd===4)drawCoin(o);else drawGrenade(o);}

  drawParts(false);
  lightPass();
  drawEmissive();
  if(G.snow.length){ctx.fillStyle='#f4f8ff';ctx.globalAlpha=.8;
    for(const f of G.snow){f.y+=f.v*dt;f.x+=(Math.sin(G.time*1.3+f.ph)*8-5)*dt;if(f.y>H)f.y-=H;if(f.x<0)f.x+=W;ctx.fillRect(Math.round(f.x),Math.round(f.y),f.s,f.s);}
    ctx.globalAlpha=1;}
  for(const f of G.floats){if(f.life/f.max<.3&&Math.floor(f.life*30)%2)continue;drawText(f.text,f.x-CX,f.y-CY,f.col,f.sc);}
  drawAlert();

  ctx.drawImage(VIG,0,0);
  const low=G.state!=='title'&&!p.dead&&p.hp<PLAYER_LOW_HP?(.28+.18*Math.sin(G.time*6.5)):0;
  const ra=Math.min(1,G.hurtV*.9+low);
  if(ra>0){ctx.globalAlpha=ra;ctx.drawImage(RED,0,0);ctx.globalAlpha=1;}
  if(G.flashScr>0){ctx.globalAlpha=Math.min(.5,G.flashScr*8);ctx.fillStyle='#fff4d8';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
  drawCross();
}
