import { clamp } from '../util.js';

export function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x];}
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function hexRGB(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
export function shade(h,k){return'#'+hexRGB(h).map(v=>clamp(Math.round(v*k),0,255).toString(16).padStart(2,'0')).join('');}
export function outline(c,col){
  const x=c.getContext('2d'),w=c.width,h=c.height,d=x.getImageData(0,0,w,h),p=d.data,[r,g,b]=hexRGB(col),mark=[];
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){
    const k=(y*w+i)*4;if(p[k+3])continue;
    if((i>0&&p[k-1])||(i<w-1&&p[k+7])||(y>0&&p[k-w*4+3])||(y<h-1&&p[k+w*4+3]))mark.push(k);
  }
  for(const k of mark){p[k]=r;p[k+1]=g;p[k+2]=b;p[k+3]=255;}
  x.putImageData(d,0,0);return c;
}
export function tint(src,col,a){const[c,x]=mk(src.width,src.height);x.drawImage(src,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=a;x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c;}
export function hash(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
export function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
export const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
