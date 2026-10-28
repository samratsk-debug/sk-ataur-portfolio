import { useEffect, useRef } from 'react';

// CAMERA CONFIGURATION
// Label: Perfect (Visible, balanced movement)
const CAMERA_CONFIG = {
  preset: 'perfect', 
  springs: {
    stiffness: 150, // Higher = snappier
    damping: 15,    // Higher = less bouncy
  },
  rotations: {
    restX: -1.5,
    restY: 0.5,
    impulseX: 4,       // Increased from 1.5 for visibility
    impulseY: 2,       // Increased from 1
    pressMaxDeg: 6,    // How far the paper tilts on click
    idleSway: 1.2,     // Amplitude of ambient sway
    scrollSway: 1.8,   // Amplitude of scroll-linked tilt
  },
  translations: {
    impulseZ: 20,      // Z-depth push on section open
  }
};

export function useResumeCamera(reducedMotion: boolean) {
  const state = useRef({
    rx: CAMERA_CONFIG.rotations.restX, 
    ry: CAMERA_CONFIG.rotations.restY, 
    tz: 0, px: 0, py: 0,
    vRx: 0, vRy: 0, vTz: 0, vPx: 0, vPy: 0,
    tRx: CAMERA_CONFIG.rotations.restX, 
    tRy: CAMERA_CONFIG.rotations.restY, 
    tTz: 0, tPx: 0, tPy: 0,
    lastTime: 0, raf: 0, isActive: false,
  });

  useEffect(() => {
    if (reducedMotion) {
      const root = document.documentElement;
      root.style.setProperty('--paper-rx', '0deg');
      root.style.setProperty('--paper-ry', '0deg');
      root.style.setProperty('--paper-tz', '0px');
      return;
    }

    const s = state.current;
    
    const loop = (time: number) => {
      if (!s.lastTime) s.lastTime = time;
      const dt = Math.min(time - s.lastTime, 32) / 1000; // clamp dt
      s.lastTime = time;

      const { stiffness, damping } = CAMERA_CONFIG.springs;

      const applySpring = (current: number, target: number, vel: number) => {
        const force = (target - current) * stiffness;
        const damper = vel * damping;
        const accel = force - damper;
        const newVel = vel + accel * dt;
        const newPos = current + newVel * dt;
        return [newPos, newVel] as const;
      };

      [s.rx, s.vRx] = applySpring(s.rx, s.tRx, s.vRx);
      [s.ry, s.vRy] = applySpring(s.ry, s.tRy, s.vRy);
      [s.tz, s.vTz] = applySpring(s.tz, s.tTz, s.vTz);
      [s.px, s.vPx] = applySpring(s.px, s.tPx, s.vPx);
      [s.py, s.vPy] = applySpring(s.py, s.tPy, s.vPy);

      // Combine base rotation + pressure rotation
      const finalRx = s.rx + s.px;
      const finalRy = s.ry + s.py;

      const root = document.documentElement;
      root.style.setProperty('--paper-rx', `${finalRx.toFixed(3)}deg`);
      root.style.setProperty('--paper-ry', `${finalRy.toFixed(3)}deg`);
      root.style.setProperty('--paper-tz', `${s.tz.toFixed(2)}px`);

      // Background parallax
      const scrollY = window.scrollY;
      root.style.setProperty('--bg-y', `${(scrollY * -0.04).toFixed(1)}px`);
      root.style.setProperty('--floor-y', `${(scrollY * 0.015).toFixed(1)}px`);

      const isMoving = 
        Math.abs(s.vRx) > 0.01 || Math.abs(s.vRy) > 0.01 || Math.abs(s.vTz) > 0.01 ||
        Math.abs(s.vPx) > 0.01 || Math.abs(s.vPy) > 0.01 ||
        Math.abs(s.rx - s.tRx) > 0.01 || Math.abs(s.ry - s.tRy) > 0.01;

      if (isMoving) {
        s.raf = requestAnimationFrame(loop);
      } else {
        s.isActive = false;
      }
    };

    const startLoop = () => {
      if (!s.isActive) {
        s.isActive = true;
        s.lastTime = 0;
        s.raf = requestAnimationFrame(loop);
      }
    };

    const onScroll = () => {
      const progress = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      
      // Ambient scroll sway
      s.tRx = CAMERA_CONFIG.rotations.restX + Math.sin(progress * Math.PI * 2) * CAMERA_CONFIG.rotations.scrollSway;
      s.tRy = CAMERA_CONFIG.rotations.restY + Math.cos(progress * Math.PI * 2) * CAMERA_CONFIG.rotations.scrollSway;
      startLoop();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    (window as any).triggerCameraImpulse = (type: 'open' | 'close') => {
      const isOpen = type === 'open';
      s.tRx = CAMERA_CONFIG.rotations.restX + (isOpen ? -CAMERA_CONFIG.rotations.impulseX : CAMERA_CONFIG.rotations.impulseX);
      s.tRy = CAMERA_CONFIG.rotations.restY + (isOpen ? CAMERA_CONFIG.rotations.impulseY : -CAMERA_CONFIG.rotations.impulseY);
      s.tTz = isOpen ? CAMERA_CONFIG.translations.impulseZ : -5;
      
      startLoop();
      
      setTimeout(() => {
        s.tRx = CAMERA_CONFIG.rotations.restX; 
        s.tRy = CAMERA_CONFIG.rotations.restY; 
        s.tTz = 0;
        startLoop();
      }, 150); 
    };

    (window as any).setPaperPressure = (x: number, y: number) => {
      s.tPx = y * CAMERA_CONFIG.rotations.pressMaxDeg;
      s.tPy = -x * CAMERA_CONFIG.rotations.pressMaxDeg;
      startLoop();
    };
    
    (window as any).releasePaperPressure = () => {
      s.tPx = 0;
      s.tPy = 0;
      startLoop();
    };

    onScroll(); // Initial set

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(s.raf);
      s.isActive = false;
      delete (window as any).triggerCameraImpulse;
      delete (window as any).setPaperPressure;
      delete (window as any).releasePaperPressure;
    };
  }, [reducedMotion]);
}