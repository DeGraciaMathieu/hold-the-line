/* Collisions : repousser un corps circulaire hors du rempart (rectangle) et
   hors des accessoires (cercles). Retournent la position corrigée sans muter l'entrée. */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* rect : {x0,x1,y0,y1}. Retourne {x,y,hit} ; hit vaut true si le corps touchait le rectangle. */
export function pushOutOfRect(pos,r,rect){
  let{x,y}=pos;const b=rect,cx=clamp(x,b.x0,b.x1),cy=clamp(y,b.y0,b.y1),dx=x-cx,dy=y-cy,d2=dx*dx+dy*dy;
  if(d2>=r*r)return{x,y,hit:false};
  if(d2>1e-4){const d=Math.sqrt(d2);x=cx+dx/d*r;y=cy+dy/d*r;}
  else{const l=x-b.x0,rr=b.x1-x,t=y-b.y0,bt=b.y1-y,m=Math.min(l,rr,t,bt);
    if(m===l)x=b.x0-r;else if(m===rr)x=b.x1+r;else if(m===t)y=b.y0-r;else y=b.y1+r;}
  return{x,y,hit:true};
}

/* props : [{x,y,dead,cols:[[cx,cy,cr],…]}]. Retourne {x,y}. */
export function pushOutOfProps(pos,r,props){
  let{x,y}=pos;
  for(const o of props){if(o.dead)continue;if(Math.abs(o.x-x)>30||Math.abs(o.y-y)>30)continue;
    for(const[cx,cy,cr]of o.cols){const dx=x-(o.x+cx),dy=y-(o.y+cy),rr=r+cr,d2=dx*dx+dy*dy;
      if(d2<rr*rr&&d2>1e-4){const d=Math.sqrt(d2),k=(rr-d)/d;x+=dx*k;y+=dy*k;}}}
  return{x,y};
}
