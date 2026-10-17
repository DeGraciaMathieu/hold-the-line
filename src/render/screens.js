import { HEAL_PRICE,LEVELS,ORDER,PERKS,REINFORCE_HP,REPAIR_HP,REPAIR_PRICE,TURRET_PRICE,WEAP,WLVL } from '../config.js';
import { reinforcePrice } from '../rules/progression.js';
import { sfx } from './audio.js';
import { $ } from './dom.js';
import { showOverlay } from './hud.js';
import { G,MAG,PK,levelOf,mouse,statsLine,turretCap,unlocked } from '../state/game.js';

export function openShop(){if(G.over)return;G.state='shop';mouse.down=false;$('#banner').className='';renderShop();showOverlay('shop');}
export function renderRoute(){
  $('#route').innerHTML=LEVELS.map((L,i)=>{const done=i<G.level||(i===G.level&&G.levelDone)||G.endless,cur=i===G.level&&!G.levelDone&&!G.endless;
    const dots=cur?`<span class="dots">${[1,2,3,4,5].map(k=>`<i class="${k===5?'bossdot ':''}${k<=G.lw?'on':''}"></i>`).join('')}</span>`:'';
    return`<li class="${done?'done':cur?'cur':''}">${L.name}${dots}</li>`;}).join('');
}
export function renderShop(flashKey,ok){
  const p=G.player,b=G.base;
  $('#shopMoney').textContent='$'+G.money;
  $('#shopEyebrow').textContent=G.levelDone?`${levelOf().name} libérée · prochain refuge : ${LEVELS[G.level+1].name}`:G.endless?`Mode infini · vague ${G.wave} repoussée`:`${levelOf().name} · vague ${G.lw} sur 5 repoussée`;
  renderRoute();
  const acc=G.shots?Math.round(G.hits/G.shots*100):0;
  const perks=Object.keys(G.perks).length?' · atouts : '+PERKS.filter(pk=>PK(pk.id)).map(pk=>pk.name+(PK(pk.id)>1?' '+PK(pk.id):'')).join(', '):'';
  $('#shopStats').textContent=`${G.waveKills} zombies abattus · précision ${acc} %${perks}`;
  let h='';
  ORDER.forEach((id,i)=>{
    const w=WEAP[id],own=!!p.owned[id],eq=p.w===id,ok2=unlocked(id),isNew=ok2&&!own&&WLVL[id]===G.level&&G.level>0&&!G.endless;
    const stats=[['Dégâts',w.statDmg!==undefined?w.statDmg:Math.min(1,w.dmg*w.pellets/150)],['Cadence',Math.min(1,(1/w.rate)/15)],['Chargeur',Math.min(1,MAG(id)/32)]];
    let act;
    if(!ok2)act=`<span class="note">Arrive à ${LEVELS[WLVL[id]].name}</span><button class="buy" disabled>Verrouillé</button>`;
    else if(!own)act=`<span class="note">${G.money>=w.price?'Disponible':'Manque $'+(w.price-G.money)}</span><button class="buy" data-act="buy" data-id="${id}"${G.money>=w.price?'':' aria-disabled="true"'}>Acheter · $${w.price}</button>`;
    else if(!w.ammo)act=`<span class="note">${eq?'En main':'Au holster'}</span><span class="tag">Munitions illimitées</span>`;
    else act=`<span class="note">${p.mag[id]} + ${p.res[id]} balles</span><button class="buy" data-act="ammo" data-id="${id}"${G.money>=w.ammo.p?'':' aria-disabled="true"'}>+${w.ammo.n} · $${w.ammo.p}</button>`;
    h+=`<article class="card${own?' owned':''}${eq?' equipped':''}${ok2?'':' locked'}" data-card="${id}"><div class="ico"><img src="${w.icon}" alt="" style="width:calc(var(--px)*${w.spr.img.width})"></div>
      <div class="cinfo"><h4><span>${w.name}</span>${isNew?'<span class="new">Nouveau</span>':`<span class="k">${(i+1)%10}</span>`}</h4><p class="desc">${w.desc}</p>
      <div class="stats">${stats.map(([n,v])=>`<span>${n}</span><i style="--v:${v.toFixed(2)}"></i>`).join('')}</div></div>
      <div class="act">${act}</div></article>`;
  });
  $('#shopWeapons').innerHTML=h;
  const cap=turretCap();
  const U=[
    {key:'repair',glyph:'+',name:'Réparer le rempart',desc:`+${REPAIR_HP} PV · ${Math.ceil(b.hp)}/${b.maxHp}`,price:REPAIR_PRICE,dis:b.hp>=b.maxHp,label:b.hp>=b.maxHp?'Intact':'Réparer'},
    {key:'reinforce',glyph:'▲',name:'Renforcer le rempart',desc:`+${REINFORCE_HP} PV maximum, et autant de réparés`,price:reinforcePrice(G.reinforce),dis:false,label:'Renforcer'},
    {key:'heal',glyph:'♥',name:'Trousse de soins',desc:`Vie au maximum · ${Math.ceil(p.hp)}/${p.maxHp}`,price:HEAL_PRICE,dis:p.hp>=p.maxHp,label:p.hp>=p.maxHp?'En forme':'Se soigner'},
    {key:'turret',glyph:'◎',name:'Tourelle automatique',desc:`Montée sur le toit, tire seule · ${G.turrets.length}/${cap}`,price:TURRET_PRICE,dis:G.turrets.length>=cap,label:G.turrets.length>=cap?'Complet':'Installer'},
  ];
  $('#shopUtil').innerHTML=U.map(u=>`<article class="card" data-card="${u.key}"><div class="ico"><span class="glyph">${u.glyph}</span></div>
    <div class="cinfo"><h4><span>${u.name}</span></h4><p class="desc">${u.desc}</p></div>
    <div class="act"><span class="note">$${u.price}</span><button class="buy" data-act="${u.key}"${u.dis?' disabled':(G.money>=u.price?'':' aria-disabled="true"')}>${u.label}</button></div></article>`).join('');
  $('#btnNext').textContent=G.levelDone?`Partir pour ${LEVELS[G.level+1].name}`:`Lancer la vague ${G.endless?G.wave+1:G.lw+1}`;
  if(flashKey){const el=document.querySelector(`[data-card="${flashKey}"]`);if(el){el.classList.add(ok?'bought':'nope');const bt=el.querySelector('[data-act]');if(bt&&!bt.disabled)bt.focus({preventScroll:true});}}
}
export function showOver(){
  G.state='over';$('#hud').hidden=true;
  const s=G.wave-1,{acc}=statsLine();
  $('#oTitle').textContent=G.reason==='base'?'Le refuge est tombé':'Vous êtes tombé';
  $('#oEyebrow').textContent=G.endless?`Mode infini · vague ${G.wave}`:`${levelOf().name} · vague ${G.lw} sur 5`;
  $('#oWaves').textContent=s;$('#oKills').textContent=G.kills;$('#oAcc').textContent=acc+' %';$('#oCash').textContent='$'+G.earned;
  $('#oBest').textContent=G.newBest?`Nouveau record : ${s} vague${s>1?'s':''} tenue${s>1?'s':''}.`:`Record : ${G.best} vague${G.best>1?'s':''} tenue${G.best>1?'s':''}.`;
  showOverlay('over');
}
export function showWin(){
  G.state='win';$('#hud').hidden=true;mouse.down=false;
  const{acc}=statsLine();
  $('#wWaves').textContent=G.wave;$('#wKills').textContent=G.kills;$('#wAcc').textContent=acc+' %';$('#wCash').textContent='$'+G.earned;
  try{localStorage.setItem('dernier-rempart-win','1');const best=+localStorage.getItem('dernier-rempart-best')||0;if(G.wave>best)localStorage.setItem('dernier-rempart-best',String(G.wave));}catch(e){}
  sfx('win');showOverlay('win');
}
