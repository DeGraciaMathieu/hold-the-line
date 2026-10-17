import { H,W } from '../config.js';

/* =========================================================
   Constantes et outils
   ========================================================= */
export const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $=s=>document.querySelector(s);
export const stage=$('#stage');
export const shell=$('#shell');
export const cv=$('#game');
export const ctx=cv.getContext('2d');
cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
