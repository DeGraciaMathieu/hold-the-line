/* Générateur pseudo-aléatoire à graine (LCG 32 bits).
   Seul main décide de la graine ; les règles reçoivent `rng` en paramètre. */
export function createRng(seed){
  let s=seed>>>0;
  return function next(){
    s=(s*1664525+1013904223)>>>0;
    return s/4294967296;
  };
}
