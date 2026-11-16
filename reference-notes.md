# Active Theory Reference Adaptation

Reference inspected: https://activetheory.net

Observable patterns from the public runtime:

- Full-viewport creative-runtime presentation with minimal chrome.
- Small utility controls and a persistent stage/index readout rather than conventional page furniture.
- A visual state counter (`/75` in the reference shell) and media/audio utility language.
- Canvas/WebGL-led presentation with touch/pointer/scroll input and a dark stage.
- Work and Contact are treated as first-class navigation states.
- The runtime disables ordinary document overflow in its stage, so the experience feels like a controlled scene rather than a standard page.

VINCEY adaptation:

- Keep VINCEY light-led, porcelain, purple, editorial, and accessible instead of copying the reference’s dark teal/black branding.
- Add `ImmersiveHUD` on the homepage with active stage index, live scroll progress, current section label, and a keyboard/clickable next-stage control.
- Preserve normal page scrolling, responsive navigation, keyboard focus, and reduced-motion support.
- Use existing React Three Fiber, Motion, GSAP/ScrollTrigger, pointer-responsive project visuals, contained ambient rings/cubes/nodes, and scroll-driven philosophy sheets as the VINCEY equivalent of a creative runtime.
- Keep all motion clipped inside sections so immersion does not create horizontal overflow.
