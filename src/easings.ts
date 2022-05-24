export default Object.freeze({
  linear: (t: number): number => t,

  // Polynomial
  easeInQuad:    (t: number): number => t*t,
  easeOutQuad:   (t: number): number => t*(2-t),
  easeInOutQuad: (t: number): number => t<.5
      ? 2*t*t
      : -1+(4-2*t)*t,
  easeInCubic:    (t: number): number => t*t*t,
  easeOutCubic:   (t: number): number => (--t)*t*t+1,
  easeInOutCubic: (t: number): number => t<.5
      ? 4*t*t*t
      : (t-1)*(2*t-2)*(2*t-2)+1,
  easeInQuart:    (t: number): number => t*t*t*t,
  easeOutQuart:   (t: number): number => 1-(--t)*t*t*t,
  easeInOutQuart: (t: number): number => t<.5
      ? 8*t*t*t*t
      : 1-8*(--t)*t*t*t,
  easeInQuint:    (t: number): number => t*t*t*t*t,
  easeOutQuint:   (t: number): number => 1+(--t)*t*t*t*t,
  easeInOutQuint: (t: number): number => t<.5
      ? 16*t*t*t*t*t
      : 1+16*(--t)*t*t*t*t,

  // Normalized Sigmoid (Lets be honest: best easing by far)
  easeOutSigmoid: (a: number): Function => (t: number): number => 0.5/((1/(1+Math.exp(-a)))-0.5)*((1/(1+Math.exp(-a*(2*((t+.5)/1.5)-1))))-0.5)+0.5,
  easeSigmoid:    (a: number): Function => (t: number): number => 0.5/((1/(1+Math.exp(-a)))-0.5)*((1/(1+Math.exp(-a*(2*t-1))))-0.5)+0.5, // Pass parameter 'a' to specify tightness 

  // Special
  easeSmoothStep: (t: number): number => 3*t*t - 2*t*t*t,

  // Sine
  easeOutSine:   (t: number): number => Math.sin(t*Math.PI*.5),
  easeInSine:    (t: number): number => Math.sin(t*Math.PI*.5-Math.PI*.5)+1,
  easeInOutSine: (t: number): number => Math.sin(t*Math.PI-Math.PI*.5)*.5+.5,

  // Circular
  easeOutCircle:   (t: number): number => 1-Math.sqrt(1-t*t),
  easeInCircle:    (t: number): number => Math.sqrt(1-Math.pow(t-1,2)),
  easeInOutCircle: (t: number): number => t<.5
      ?.5-.5*Math.sqrt(1-4*t*t)
      :.5+Math.sqrt(1-Math.pow((t-1)*2,2))*.5,
  easeInOutInvCircle: (t: number): number => t<.5
      ?Math.sqrt(-(t-1)*t)
      :1-Math.sqrt(-(t-1)*t),

  // Backout
  easeBackOut: (p: number): Function => (t: number): number => --t*t*((p+1)*t+p)+1,
  
  // Elastic (todo: add elasticity argument)
  easeOutElastic: (t: number): number => Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0,
});
