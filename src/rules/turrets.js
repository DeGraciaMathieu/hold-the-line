/* Règles des tourelles automatiques : nombre maximal et cadence selon l'atout Armurier. Pures. */
import { TURRET_POS,TURRET_BASE_COUNT,TURRET_RATE,PERK_TURRET_RATE_FACTOR } from '../config.js';

export function turretCapacity(perks){return Math.min(TURRET_POS.length,TURRET_BASE_COUNT+(perks.turret||0));}

export function turretRate(perks){return TURRET_RATE*Math.pow(PERK_TURRET_RATE_FACTOR,(perks.turret||0));}
