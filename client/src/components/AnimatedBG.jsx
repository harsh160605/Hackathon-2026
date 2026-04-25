import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AnimatedBG — Global canvas background.
 * Adapts to user role: yellowish-green (volunteer) and reddish-green (ngo).
 */
const AnimatedBG = () => {
  const canvasRef = useRef(null);
  const { user } = useAuth();
  
  // Determine theme based on role
  const theme = user?.role === 'ngo' ? 'ngo' : user?.role === 'volunteer' ? 'volunteer' : 'default';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Color definitions based on theme
    let bgBase, gridColor, scanColor, sweepColor;
    let particleColorFn; 
    let initialOrbs = [];

    if (theme === 'volunteer') {
      // Yellowish-green / Lime theme
      bgBase = '#090d02';
      gridColor = 'rgba(132,204,22,0.08)';
      scanColor = 'rgba(132,204,22,0.05)';
      sweepColor = 'rgba(163,230,53,0.03)';
      particleColorFn = (alpha) => `rgba(163,230,53,${alpha})`;
      initialOrbs = [
        { x: 0.1,  y: 0.08, r: 350, color: 'rgba(101,163,13,0.18)',   vx:  0.00013, vy:  0.00009 },
        { x: 0.78, y: 0.28, r: 400, color: 'rgba(132,204,22,0.13)',  vx: -0.00011, vy:  0.00007 },
        { x: 0.42, y: 0.72, r: 450, color: 'rgba(163,230,53,0.10)',  vx:  0.00009, vy: -0.00013 },
        { x: 0.88, y: 0.82, r: 280, color: 'rgba(190,242,100,0.12)', vx: -0.00016, vy:  0.00011 },
        { x: 0.25, y: 0.5,  r: 300, color: 'rgba(77,124,15,0.15)',   vx:  0.00007, vy:  0.00015 },
      ];
    } else if (theme === 'ngo') {
      // Reddish-green theme (mix of crimson/red and emerald/green)
      bgBase = '#110606';
      gridColor = 'rgba(239,68,68,0.06)';
      scanColor = 'rgba(34,197,94,0.04)';
      sweepColor = 'rgba(239,68,68,0.03)';
      particleColorFn = (alpha, index) => index % 2 === 0 ? `rgba(239,68,68,${alpha})` : `rgba(34,197,94,${alpha})`;
      initialOrbs = [
        { x: 0.15, y: 0.1,  r: 380, color: 'rgba(220,38,38,0.15)',   vx:  0.00014, vy:  0.0001 },
        { x: 0.75, y: 0.3,  r: 350, color: 'rgba(16,185,129,0.12)',  vx: -0.00012, vy:  0.00008 },
        { x: 0.4,  y: 0.8,  r: 420, color: 'rgba(153,27,27,0.14)',   vx:  0.00008, vy: -0.00014 },
        { x: 0.85, y: 0.7,  r: 250, color: 'rgba(52,211,153,0.14)',  vx: -0.00017, vy:  0.00012 },
        { x: 0.2,  y: 0.6,  r: 320, color: 'rgba(185,28,28,0.13)',   vx:  0.00006, vy:  0.00016 },
      ];
    } else {
      // Default (Emerald Green)
      bgBase = '#030d06';
      gridColor = 'rgba(34,197,94,0.07)';
      scanColor = 'rgba(34,197,94,0.04)';
      sweepColor = 'rgba(34,197,94,0.025)';
      particleColorFn = (alpha) => `rgba(74,222,128,${alpha})`;
      initialOrbs = [
        { x: 0.1,  y: 0.08, r: 320, color: 'rgba(34,197,94,0.18)',   vx:  0.00013, vy:  0.00009 },
        { x: 0.78, y: 0.28, r: 380, color: 'rgba(16,185,129,0.13)',  vx: -0.00011, vy:  0.00007 },
        { x: 0.42, y: 0.72, r: 420, color: 'rgba(74,222,128,0.10)',  vx:  0.00009, vy: -0.00013 },
        { x: 0.88, y: 0.82, r: 240, color: 'rgba(52,211,153,0.15)',  vx: -0.00016, vy:  0.00011 },
        { x: 0.25, y: 0.5,  r: 280, color: 'rgba(21,128,61,0.12)',   vx:  0.00007, vy:  0.00015 },
      ];
    }

    /* ── Particles ── */
    const PARTICLE_COUNT = 90;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      index:   i,
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      r:       Math.random() * 2.8 + 0.5,
      vx:      (Math.random() - 0.5) * 0.35,
      vy:      -(Math.random() * 0.55 + 0.15),
      alpha:   Math.random() * 0.65 + 0.2,
      life:    Math.random(),
      maxLife: Math.random() * 0.4 + 0.6,
    }));

    /* ── Orbs ── */
    const orbs = initialOrbs;

    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);

      /* — base fill — */
      ctx.fillStyle = bgBase;
      ctx.fillRect(0, 0, W, H);

      /* — scrolling dot grid — */
      const gs = 55;
      const off = (t * 0.25) % gs;
      ctx.fillStyle = gridColor;
      for (let x = (off % gs); x < W + gs; x += gs) {
        for (let y = (off % gs); y < H + gs; y += gs) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* — floating orbs — */
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.2 || o.x > 1.2) o.vx *= -1;
        if (o.y < -0.2 || o.y > 1.2) o.vy *= -1;

        const grd = ctx.createRadialGradient(o.x * W, o.y * H, 0, o.x * W, o.y * H, o.r);
        grd.addColorStop(0, o.color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(o.x * W, o.y * H, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* — particles — */
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.0025;

        if (p.life > p.maxLife || p.y < -10) {
          p.x     = Math.random() * W;
          p.y     = H + 10;
          p.life  = 0;
          p.alpha = Math.random() * 0.65 + 0.2;
          p.vx    = (Math.random() - 0.5) * 0.35;
          p.vy    = -(Math.random() * 0.55 + 0.15);
        }

        const fade = Math.sin((p.life / p.maxLife) * Math.PI);
        const grd  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        grd.addColorStop(0, particleColorFn(p.alpha * fade, p.index));
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      /* — horizontal scanline beam — */
      const scanY = ((t * 1.2) % (H + 80)) - 40;
      const sGrd  = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      sGrd.addColorStop(0, 'transparent');
      sGrd.addColorStop(0.5, scanColor);
      sGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = sGrd;
      ctx.fillRect(0, scanY - 50, W, 100);

      /* — diagonal sweep accent (slow) — */
      const sweepX = ((t * 0.3) % (W + 200)) - 100;
      const swGrd  = ctx.createLinearGradient(sweepX - 60, 0, sweepX + 60, H);
      swGrd.addColorStop(0, 'transparent');
      swGrd.addColorStop(0.5, sweepColor);
      swGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = swGrd;
      ctx.fillRect(sweepX - 60, 0, 120, H);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
};

export default AnimatedBG;
