import { useEffect } from 'react';

export function useScrollMotion({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.style.setProperty('--paper-rx', '2deg'); root.style.setProperty('--paper-ry', '-3deg');
      root.style.setProperty('--paper-tz', '0px'); root.style.setProperty('--bg-y', '0px'); root.style.setProperty('--floor-y', '0px');
      return;
    }
    let raf = 0, targetScroll = window.scrollY, smoothScroll = targetScroll, maxScroll = 1;
    const start = performance.now(), strength = mobile ? 0.5 : 1;
    
    const onScroll = () => { targetScroll = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    
    const recompute = () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(document.body);

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      smoothScroll += (targetScroll - smoothScroll) * 0.12;
      const progress = smoothScroll / maxScroll;
      const idleRx = Math.sin(t * 0.45) * 0.3, idleRy = Math.cos(t * 0.35) * 0.4;
      const scrollRx = Math.sin(progress * Math.PI * 2) * 1.2, scrollRy = Math.cos(progress * Math.PI * 2) * 1.4;
      
      // Only apply scroll motion if the user hasn't just triggered a custom impulse
      if (!root.style.transition) {
        root.style.setProperty('--paper-rx', (3 + (idleRx + scrollRx) * strength).toFixed(3) + 'deg');
        root.style.setProperty('--paper-ry', (-4 + (idleRy + scrollRy) * strength).toFixed(3) + 'deg');
        root.style.setProperty('--paper-tz', (Math.sin(t * 0.25) * 3 * strength).toFixed(2) + 'px');
      }
      
      root.style.setProperty('--bg-y', (smoothScroll * -0.04).toFixed(1) + 'px');
      root.style.setProperty('--floor-y', (smoothScroll * 0.015).toFixed(1) + 'px');
      
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    
    return () => { window.removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [reducedMotion, mobile]);
}