import { DT_MAX } from '../config.js';
import { update } from './update.js';
import { render } from '../render/draw.js';
import { hudUpdate } from '../render/hud.js';
import { G,paused } from '../state/game.js';

export let lastT=performance.now();
export function frame(now){
  const dt=Math.min(DT_MAX,(now-lastT)/1000);lastT=now;
  if((G.state==='play'||G.state==='over')&&!paused)update(dt);
  render(dt);
  hudUpdate(dt);
  requestAnimationFrame(frame);
}
