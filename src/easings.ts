export const linear = (t: number): number => t;
export const easeInQuad = (t: number): number => t*t;
export const easeOutQuad = (t: number): number => t*(2-t);
export const easeInOutQuad = (t: number): number => t<.5 ? 2*t*t : -1+(4-2*t)*t;
export const easeInCubic = (t: number): number => t*t*t;
export const easeOutCubic = (t: number): number => (--t)*t*t+1;
export const easeInOutCubic = (t: number): number => t<.5? 4*t*t*t: (t-1)*(2*t-2)*(2*t-2)+1;
export const easeInQuart = (t: number): number => t*t*t*t;
export const easeOutQuart = (t: number): number => 1-(--t)*t*t*t;
export const easeInOutQuart = (t: number): number => t<.5? 8*t*t*t*t: 1-8*(--t)*t*t*t;
export const easeInQuint = (t: number): number => t*t*t*t*t;
export const easeOutQuint = (t: number): number => 1+(--t)*t*t*t*t;
export const easeInOutQuint = (t: number): number => t<.5? 16*t*t*t*t*t: 1+16*(--t)*t*t*t*t;
export const easeOutSigmoid = (a: number): Function => (t: number): number => 0.5/((1/(1+Math.exp(-a)))-0.5)*((1/(1+Math.exp(-a*(2*((t+.5)/1.5)-1))))-0.5)+0.5;
export const easeSigmoid = (a: number): Function => (t: number): number => 0.5/((1/(1+Math.exp(-a)))-0.5)*((1/(1+Math.exp(-a*(2*t-1))))-0.5)+0.5;
export const easeSmoothStep = (t: number): number => 3*t*t - 2*t*t*t;
export const easeOutSine = (t: number): number => Math.sin(t*Math.PI*.5);
export const easeInSine = (t: number): number => Math.sin(t*Math.PI*.5-Math.PI*.5)+1;
export const easeInOutSine = (t: number): number => Math.sin(t*Math.PI-Math.PI*.5)*.5+.5;
export const easeOutCircle = (t: number): number => 1-Math.sqrt(1-t*t);
export const easeInCircle = (t: number): number => Math.sqrt(1-Math.pow(t-1,2));
export const easeInOutCircle = (t: number): number => t<.5?.5-.5*Math.sqrt(1-4*t*t):.5+Math.sqrt(1-Math.pow((t-1)*2,2))*.5;
export const easeInOutInvCircle = (t: number): number => t<.5 ?Math.sqrt(-(t-1)*t):1-Math.sqrt(-(t-1)*t);
export const easeBackOut = (p: number): Function => (t: number): number => --t*t*((p+1)*t+p)+1;
export const easeOutElastic = (x: number): number => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1;

export default Object.freeze({
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeOutSigmoid,
  easeSigmoid,
  easeSmoothStep,
  easeOutSine,
  easeInSine,
  easeInOutSine,
  easeOutCircle,
  easeInCircle,
  easeInOutCircle,
  easeInOutInvCircle,
  easeBackOut,
  easeOutElastic
});
