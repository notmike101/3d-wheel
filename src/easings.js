export default {
  linear: (t) => t,

  // Polynomial
  easeInQuad:    (t) => t*t,
  easeOutQuad:   (t) => t*(2-t),
  easeInOutQuad: (t) => t<.5
      ? 2*t*t
      : -1+(4-2*t)*t,
  easeInCubic:    (t) => t*t*t,
  easeOutCubic:   (t) => (--t)*t*t+1,
  easeInOutCubic: (t) => t<.5
      ? 4*t*t*t
      : (t-1)*(2*t-2)*(2*t-2)+1,
  easeInQuart:    (t) => t*t*t*t,
  easeOutQuart:   (t) => 1-(--t)*t*t*t,
  easeInOutQuart: (t) => t<.5
      ? 8*t*t*t*t
      : 1-8*(--t)*t*t*t,
  easeInQuint:    (t) => t*t*t*t*t,
  easeOutQuint:   (t) => 1+(--t)*t*t*t*t,
  easeInOutQuint: (t) => t<.5
      ? 16*t*t*t*t*t
      : 1+16*(--t)*t*t*t*t,

  // Normalized Sigmoid (Lets be honest: best easing by far)
  easeOutSigmoid: (a) => (t) => 0.5/((1/(1+Math.exp(-a)))-0.5)*((1/(1+Math.exp(-a*(2*((t+.5)/1.5)-1))))-0.5)+0.5,
  easeSigmoid:    (a) => (t) => 0.5/((1/(1+Math.exp(-a)))-0.5)*((1/(1+Math.exp(-a*(2*t-1))))-0.5)+0.5, // Pass parameter 'a' to specify tightness 

  // Special
  easeSmoothStep: (t) => 3*t*t - 2*t*t*t,

  // Sine
  easeOutSine:   (t) => Math.sin(t*Math.PI*.5),
  easeInSine:    (t) => Math.sin(t*Math.PI*.5-Math.PI*.5)+1,
  easeInOutSine: (t) => Math.sin(t*Math.PI-Math.PI*.5)*.5+.5,

  // Circular
  easeOutCircle:   (t) => 1-Math.sqrt(1-t*t),
  easeInCircle:    (t) => Math.sqrt(1-Math.pow(t-1,2)),
  easeInOutCircle: (t) => t<.5
      ?.5-.5*Math.sqrt(1-4*t*t)
      :.5+Math.sqrt(1-Math.pow((t-1)*2,2))*.5,
  easeInOutInvCircle: (t) => t<.5
      ?Math.sqrt(-(t-1)*t)
      :1-Math.sqrt(-(t-1)*t),

  // Backout
  easeBackOut: (p) => (t) => --t*t*((p+1)*t+p)+1,
  
  // Elastic (todo: add elasticity argument)
  easeOutElastic: (t) => Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0,
};
