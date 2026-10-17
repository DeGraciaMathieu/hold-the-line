/* =========================================================
   Configuration : toutes les valeurs nommées du jeu.
   Aucun import, aucune logique.
   ========================================================= */

/* Géométrie du canvas et du monde */
export const W=384,H=216,WW=768,WH=480,GH=8,BX=WW/2,BY=WH/2,LW=W/2,LH=H/2;

/* Refuge : dimensions de la boîte 2.5D (largeur, profondeur, hauteur) */
export const BW=64,BD=26,BHT=20;

/* Points de vie initiaux */
export const PLAYER_HP=100;
export const BASE_HP=400;
export const BARREL_HP=25;

/* Joueur */
export const PLAYER_SPEED=72;
export const PLAYER_RELOAD_SPEED_FACTOR=.85;
export const MINIGUN_SPIN_SLOW=.45;
export const PLAYER_INV_TIME=.55;
export const PLAYER_HURT_KNOCK=140;
export const PLAYER_LOW_HP=30;
export const HEARTBEAT_INTERVAL=.95;

/* Mêlée (coup de crosse) */
export const MELEE_DMG=18;
export const MELEE_RANGE=20;
export const MELEE_KNOCK=320;

/* Coups critiques */
export const CRIT_BASE_CHANCE=.1;
export const CRIT_MULT=2;

/* Combo et pièces */
export const COMBO_CAP=10;
export const COMBO_COIN_BONUS=.1;
export const COMBO_TIME=1.8;
export const COIN_RADIUS=58;

/* Tourelles */
export const TURRET_BASE_COUNT=2;
export const TURRET_RATE=.22;
export const TURRET_RANGE=140;

/* Boucle */
export const DT_MAX=.05;

/* Atouts : effets numériques par niveau */
export const PERK_MAG_BONUS=.3;
export const PERK_RELOAD_FACTOR=.75;
export const PERK_DMG_BONUS=.2;
export const PERK_CRIT_BONUS=.1;
export const PERK_PYRO_CHANCE=.15;
export const PYRO_BURN_TIME=2;
export const PERK_GORE_CHANCE=.15;
export const PERK_SPEED_BONUS=.15;
export const PERK_HP_BONUS=30;
export const PERK_FORT_BONUS=150;
export const PERK_LEECH_HP=2;
export const PERK_MAGNET_RADIUS_BONUS=.8;
export const PERK_MAGNET_COIN_BONUS=.2;
export const PERK_TURRET_RATE_FACTOR=.6;

/* Vagues */
export const WAVES_PER_LEVEL=5;
export const WAVE_BASE_SIZE=6;
export const WAVE_SIZE_PER_WAVE=3.2;
export const BOSS_WAVE_SIZE_FACTOR=.6;
export const ENDLESS_WAVE_SIZE_FACTOR=1.1;
export const ZOMBIE_HP_PER_WAVE=.07;
export const BOSS_ENDLESS_HP_FROM_WAVE=20;
export const BOSS_ENDLESS_HP_PER_WAVE=.06;
export const FIRST_SPAWN_DELAY=1.4;
export const SPAWN_GAP_BASE=1.3;
export const SPAWN_GAP_PER_WAVE=.05;
export const SPAWN_GAP_MIN=.28;
export const BOSS_DELAY=7;
export const WAVE_BONUS_BASE=40;
export const WAVE_BONUS_PER_WAVE=15;
export const WAVE_BONUS_INTACT=50;
export const WAVE_BONUS_BOSS=200;
export const INTACT_BASE_RATIO=.9;
export const PERK_WAVES=[2,4];
export const ENDLESS_PERK_EVERY=3;

/* Boutique */
export const REPAIR_PRICE=80;
export const REPAIR_HP=120;
export const REINFORCE_PRICE_BASE=180;
export const REINFORCE_PRICE_STEP=60;
export const REINFORCE_HP=60;
export const HEAL_PRICE=60;
export const TURRET_PRICE=650;

/* =========================================================
   Armes
   ========================================================= */
export const SKIN='#e2a97c';
export const WEAP={
  pistol:{name:'Pistolet',desc:'Fiable, munitions illimitées.',dmg:20,rate:.17,auto:false,mag:12,res:Infinity,reload:.85,spread:.035,bloom:.06,maxBloom:.18,recover:.9,
    speed:440,range:230,knock:80,shake:.17,kick:3,camKick:1.6,price:0,ammo:null,snd:'pistol',casing:'casing',flashL:5,
    rects:[[-1,-3,8,2,'#4a4f5a'],[-1,-3,8,1,'#717886'],[6,-3,1,1,'#22252b'],[-1,-1,3,4,'#26282e'],[-1,-1,2,2,SKIN]],muzzle:[7,-2]},
  uzi:{name:'Uzi',desc:'Arrose tout ce qui approche.',dmg:9,rate:.06,auto:true,mag:32,reload:1.2,spread:.07,bloom:.022,maxBloom:.22,recover:.7,
    speed:430,range:190,knock:34,shake:.09,kick:2,camKick:.9,price:300,ammo:{n:64,p:45},snd:'uzi',casing:'casing',flashL:4,
    rects:[[-2,-4,9,3,'#33363e'],[-2,-4,9,1,'#5a5f6b'],[7,-3,2,1,'#1b1c21'],[1,-1,2,5,'#1d1f24'],[-4,-3,2,1,'#2a2c32'],[-1,-1,2,2,SKIN]],muzzle:[9,-3]},
  magnum:{name:'Magnum',desc:'Six coups qui traversent deux zombies. Les douilles tombent au rechargement.',dmg:65,pierce:2,rate:.36,auto:false,mag:6,reload:1.5,dump:true,spread:.02,bloom:.08,maxBloom:.2,recover:.8,
    speed:520,range:260,knock:170,shake:.42,kick:5,camKick:3.5,push:15,hitstop:.025,price:450,ammo:{n:18,p:40},snd:'magnum',casing:null,flashL:8,
    rects:[[-1,-3,10,2,'#9aa0aa'],[-1,-3,10,1,'#c8ced8'],[1,-2,4,3,'#6c727c'],[-2,-1,3,4,'#5a3a24'],[-1,-1,2,2,SKIN],[9,-3,1,1,'#3a3d44']],muzzle:[10,-2]},
  shotgun:{name:'Fusil à pompe',desc:'Repousse la horde. Recharge cartouche par cartouche.',dmg:11,pellets:8,rate:.72,auto:false,mag:6,reload:.38,perShell:true,spread:.26,bloom:0,recover:1,
    speed:380,range:125,knock:150,shake:.5,kick:5,camKick:4,push:60,price:550,ammo:{n:12,p:50},snd:'shotgun',casing:'shell',delayEject:.24,ejectSnd:'pump',flashL:9,
    rects:[[-7,-2,7,3,'#7a4a2a'],[-7,-2,7,1,'#9b663a'],[0,-3,15,2,'#585d68'],[0,-3,15,1,'#80869a'],[6,-1,5,2,'#6a3e22'],[6,-1,5,1,'#85512e'],[-1,-1,2,2,SKIN]],muzzle:[15,-2]},
  ak:{name:'AK-47',desc:'Puissant, automatique, ça cogne.',dmg:22,rate:.095,auto:true,mag:30,reload:1.6,spread:.04,bloom:.02,maxBloom:.16,recover:.6,
    speed:480,range:240,knock:58,shake:.2,kick:3,camKick:1.8,price:900,ammo:{n:60,p:65},snd:'ak',casing:'casing',flashL:7,
    rects:[[-7,-2,7,2,'#8a5530'],[-7,-2,7,1,'#a76a3e'],[0,-3,13,2,'#3c3d40'],[0,-3,13,1,'#62646a'],[7,-3,4,2,'#8a5530'],[13,-3,3,1,'#2a2a2c'],[3,-1,2,3,'#2a2a2c'],[4,2,2,1,'#2a2a2c'],[-1,-1,2,2,SKIN]],muzzle:[16,-3]},
  flamer:{name:'Lance-flammes',desc:'Courte portée. Enflamme la horde, et le feu se propage.',dmg:5,flame:true,rate:.03,auto:true,mag:100,reload:2.2,spread:.14,bloom:0,recover:1,
    speed:170,range:95,knock:14,shake:.035,kick:1,camKick:.25,price:1100,ammo:{n:100,p:60},snd:'flame',casing:null,flashL:0,statDmg:.5,
    rects:[[-5,-3,6,5,'#8a2a22'],[-5,-3,6,1,'#b8443a'],[1,-2,12,2,'#4a4f5a'],[1,-2,12,1,'#6d7380'],[13,-3,2,4,'#2a2c32'],[4,0,2,3,'#2a2c32'],[-1,-1,2,2,SKIN]],muzzle:[16,-1]},
  sniper:{name:'Fusil de précision',desc:'Traverse jusqu’à six zombies alignés. Ignore l’armure.',dmg:140,pierce:6,rate:.95,auto:false,mag:5,reload:2,spread:0,bloom:0,recover:1,
    speed:900,range:420,knock:220,shake:.6,kick:6,camKick:5,push:30,hitstop:.05,price:1300,ammo:{n:10,p:70},snd:'sniper',casing:'casing',delayEject:.38,ejectSnd:'bolt',flashL:10,
    rects:[[-8,-2,8,3,'#4d5a3a'],[-8,-2,8,1,'#66754c'],[0,-3,19,2,'#2e3530'],[0,-3,19,1,'#4b554e'],[3,-5,7,2,'#17181a'],[9,-5,1,2,'#7fc0e0'],[2,-1,2,2,'#2a2a2c'],[-1,-1,2,2,SKIN]],muzzle:[19,-2]},
  launcher:{name:'Lance-grenades',desc:'Dégâts de zone. Gare au souffle.',dmg:150,radius:46,grenade:true,rate:.75,auto:false,mag:4,reload:2.2,spread:.02,bloom:0,recover:1,
    speed:250,range:210,knock:0,shake:.35,kick:5,camKick:3,push:20,price:1700,ammo:{n:4,p:90},snd:'launcher',casing:null,flashL:6,
    rects:[[-4,-4,14,5,'#4f5a3a'],[-4,-4,14,1,'#6d7a52'],[10,-5,2,7,'#2c2f26'],[1,1,2,3,'#2c2f26'],[-6,-3,2,3,'#3a4229'],[-1,0,2,2,SKIN]],muzzle:[12,-2]},
  minigun:{name:'Minigun',desc:'Il faut la lancer avant qu’elle crache. Ralentit le tireur.',dmg:9,rate:.035,auto:true,spin:.55,mag:150,reload:3,spread:.09,bloom:.004,maxBloom:.12,recover:.5,
    speed:460,range:220,knock:30,shake:.06,kick:2,camKick:.6,push:4,price:2200,ammo:{n:150,p:110},snd:'minigun',casing:'casing',flashL:6,statDmg:.35,
    rects:[[-6,-2,6,4,'#3a3d44'],[-6,-2,6,1,'#5a5f6b'],[0,-4,5,6,'#2f3238'],[0,-4,5,1,'#565b66'],[5,-4,13,1,'#4d525c'],[5,-3,13,1,'#2a2c32'],[5,-2,13,1,'#4d525c'],[5,-1,13,1,'#2a2c32'],[18,-4,2,4,'#1b1c21'],[1,2,3,3,'#24262c'],[-8,0,3,4,'#6a5a2a'],[-1,0,2,2,SKIN]],muzzle:[20,-2]},
  railgun:{name:'Railgun',desc:'Se charge une demi-seconde, puis traverse tout l’écran.',dmg:400,charge:.5,rate:.9,auto:false,mag:3,reload:2.6,spread:0,bloom:0,recover:1,
    speed:0,range:520,knock:300,shake:.9,kick:8,camKick:6,push:70,price:2800,ammo:{n:6,p:120},snd:'rail',casing:null,flashL:10,
    rects:[[-7,-2,7,3,'#2c3240'],[-7,-2,7,1,'#46506a'],[0,-4,20,2,'#3a4258'],[0,-4,20,1,'#5c6a8a'],[0,-2,20,1,'#1c2030'],[3,-3,14,1,'#5fe0ff'],[20,-4,2,3,'#1c2030'],[4,-1,2,3,'#1c2030'],[-1,-1,2,2,SKIN]],muzzle:[22,-3]},
};
export const ORDER=['pistol','uzi','magnum','shotgun','ak','flamer','sniper','launcher','minigun','railgun'];
export const WLVL={pistol:0,uzi:0,magnum:0,shotgun:0,ak:1,flamer:1,sniper:2,launcher:2,minigun:2,railgun:3};
export const PIERCE_ARMOR={sniper:1,railgun:1,magnum:1};

/* =========================================================
   Campagne : quatre refuges, boss et atouts
   ========================================================= */
export const LEVELS=[
  {id:'ferme',name:'La Ferme',sub:'Bois de Saint-Aubin',intro:'Tenez la grange jusqu’au matin',dark:'rgba(12,18,40,.38)',seed:1234,roadAmp:9,
    ground:{base:[[38,54,34],[46,64,40],[56,76,47],[67,90,55]],clear:[[72,59,44],[85,70,51],[98,81,59],[114,94,68]],road:'clear',ruts:true,edge:[22,30,24],speck:[[84,108,62],[132,112,84]]},
    decor:'farm',boss:'butcher',
    mix:[{walker:1},{walker:.8,runner:.2},{walker:.7,runner:.2,bloater:.1},{walker:.6,runner:.25,bloater:.1,brute:.05},{walker:.7,runner:.3}]},
  {id:'banlieue',name:'La Banlieue',sub:'Lotissement des Tilleuls',intro:'Nouveau : les cracheurs tirent de loin',dark:'rgba(14,16,40,.44)',seed:2301,roadAmp:0,vroads:[BX-190,BX+190],
    ground:{base:[[46,66,40],[54,76,46],[62,86,52],[72,98,60]],clear:[[92,90,88],[102,100,97],[112,110,106],[124,121,116]],road:[[46,47,52],[54,55,60],[62,63,68],[70,71,77]],
      side:[[120,118,114],[132,130,126]],marks:[196,180,100],edge:[26,32,30],speck:[[90,118,70],[140,136,130]]},
    decor:'suburb',boss:'matriarch',
    mix:[{walker:.6,runner:.3,spitter:.1},{walker:.5,runner:.3,spitter:.2},{walker:.45,runner:.25,spitter:.15,bloater:.15},{walker:.4,runner:.25,spitter:.15,bloater:.1,brute:.1},{walker:.5,runner:.3,spitter:.2}]},
  {id:'usine',name:'L’Usine',sub:'Zone industrielle Nord',intro:'Nouveau : les blindés encaissent les petits calibres',dark:'rgba(16,14,30,.42)',seed:3407,roadAmp:0,
    ground:{base:[[70,70,72],[80,79,80],[90,89,89],[100,98,97]],patch:{th:.6,pal:[[70,56,42],[82,66,48],[94,76,55],[106,86,62]]},clear:[[104,104,100],[114,113,108],[124,122,116],[134,132,126]],
      road:[[44,45,50],[52,53,58],[60,61,66],[68,69,74]],marks:[210,166,40],edge:[30,30,34],speck:[[120,118,112],[40,36,32]]},
    decor:'industry',boss:'scrapper',
    mix:[{walker:.5,runner:.2,armored:.2,spitter:.1},{walker:.4,runner:.2,armored:.25,spitter:.1,bloater:.05},{walker:.3,runner:.2,armored:.25,spitter:.1,bloater:.1,brute:.05},{walker:.25,runner:.2,armored:.25,spitter:.1,bloater:.1,brute:.1},{walker:.4,armored:.3,runner:.3}]},
  {id:'col',name:'Le Col',sub:'Refuge du col de l’Aigle',intro:'Dernier refuge avant l’aube',dark:'rgba(20,28,60,.3)',seed:4513,roadAmp:14,snow:true,
    ground:{base:[[196,206,220],[208,216,230],[220,228,238],[234,238,246]],patch:{th:.68,pal:[[104,112,124],[118,126,138],[132,140,152],[148,156,166]]},clear:[[160,170,186],[172,182,196],[184,194,206],[196,204,214]],
      road:'clear',ruts:true,edge:[88,100,122],speck:[[250,252,255],[150,160,176]]},
    decor:'snow',boss:'titan',
    mix:[{walker:.35,runner:.25,armored:.15,spitter:.1,bloater:.1,brute:.05},{walker:.3,runner:.25,armored:.15,spitter:.12,bloater:.1,brute:.08},{walker:.25,runner:.25,armored:.18,spitter:.12,bloater:.1,brute:.1},{walker:.2,runner:.25,armored:.2,spitter:.12,bloater:.1,brute:.13},{runner:.4,armored:.3,walker:.3}]},
];
export const BOSSES={
  butcher:{name:'Le Boucher',hp:1600,speed:20,r:10,mass:12,dmg:28,baseDmg:30,atk:1.2,reward:300,armor:0,abil:['charge'],target:'player',aggro:9999},
  matriarch:{name:'La Matriarche',hp:2000,speed:13,r:11,mass:14,dmg:20,baseDmg:40,atk:1.5,reward:400,armor:0,abil:['summon','spit'],target:'base',aggro:60,acid:true},
  scrapper:{name:'Le Ferrailleur',hp:2600,speed:15,r:10,mass:16,dmg:30,baseDmg:35,atk:1.3,reward:500,armor:5,abil:['stomp','charge'],target:'mixed',aggro:130},
  titan:{name:'Le Titan du Col',hp:4200,speed:17,r:12,mass:20,dmg:35,baseDmg:45,atk:1.2,reward:800,armor:4,abil:['charge','stomp','summon'],target:'player',aggro:9999},
};
export const BOSS_ORDER=['butcher','matriarch','scrapper','titan'];
export const PERKS=[
  {id:'reload',name:'Mains rapides',desc:'Rechargement 25 % plus rapide.',glyph:'R',max:3},
  {id:'dmg',name:'Gâchette lourde',desc:'+20 % de dégâts sur toutes les armes.',glyph:'+',max:5},
  {id:'mag',name:'Chargeurs étendus',desc:'+30 % de balles par chargeur.',glyph:'C',max:3},
  {id:'speed',name:'Jambes de coureur',desc:'+15 % de vitesse de déplacement.',glyph:'»',max:3},
  {id:'hp',name:'Peau dure',desc:'+30 PV maximum et soin complet.',glyph:'♥',max:5},
  {id:'magnet',name:'Aimant',desc:'Ramassage bien plus large, pièces +20 %.',glyph:'$',max:3},
  {id:'leech',name:'Vampire',desc:'Chaque zombie abattu rend 2 PV.',glyph:'V',max:3},
  {id:'fort',name:'Fortifications',desc:'+150 PV maximum au rempart, réparé.',glyph:'▲',max:5},
  {id:'pierce',name:'Balles perforantes',desc:'Les balles traversent un zombie de plus.',glyph:'→',max:3},
  {id:'crit',name:'Œil de lynx',desc:'+10 % de chances de coup critique.',glyph:'◎',max:3},
  {id:'pyro',name:'Pyromane',desc:'15 % des balles enflamment leur cible.',glyph:'F',max:2},
  {id:'gore',name:'Carnage',desc:'15 % des zombies abattus explosent et blessent leurs voisins.',glyph:'X',max:2},
  {id:'turret',name:'Armurier',desc:'Tourelles 40 % plus rapides, une tourelle offerte.',glyph:'T',max:2},
];

/* =========================================================
   Zombies
   ========================================================= */
export const ZT={
  walker:{hp:40,speed:18,r:4.5,dmg:8,baseDmg:6,atk:1,reward:10,aggro:55,mass:1},
  runner:{hp:28,speed:46,r:4,dmg:6,baseDmg:4,atk:.7,reward:14,aggro:9999,mass:.8},
  brute:{hp:320,speed:12,r:7.5,dmg:22,baseDmg:20,atk:1.4,reward:60,aggro:45,mass:4},
  bloater:{hp:70,speed:14,r:6,dmg:0,baseDmg:0,atk:9,reward:22,aggro:0,mass:2},
  spitter:{hp:35,speed:22,r:4,dmg:5,baseDmg:3,atk:2.3,reward:18,aggro:0,mass:.9,ranged:{range:88,dmg:10,baseDmg:8}},
  armored:{hp:90,speed:16,r:5,dmg:12,baseDmg:9,atk:1.1,reward:26,aggro:55,mass:1.6,armor:6},
};

/* Barils fixes autour du refuge et emplacements de tourelles sur le toit */
export const BARRELS=[.25,1.35,2.2,3.4,4.6,5.6].map(a=>({x:BX+Math.cos(a)*122,y:BY+Math.sin(a)*86}));
export const TURRET_POS=[[-22,8],[22,8],[-10,16],[10,16]];
