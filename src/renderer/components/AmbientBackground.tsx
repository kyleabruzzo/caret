import { useEffect, useRef } from 'react';
import { editorRef } from '../lib/editor-ref';

type Props = {
  enabled: boolean;
  color: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vxNat: number;
  vyNat: number;
  r: number;
  alpha: number;
  drift: number;
};

const COUNT = 420;
const SYNC_EVERY = 10;

const MOUSE_R = 110;
const MOUSE_R2 = MOUSE_R * MOUSE_R;
const MOUSE_FORCE = 2.2;

const CURSOR_R = 90;
const CURSOR_R2 = CURSOR_R * CURSOR_R;
const CURSOR_FORCE = 4.5;
const CURSOR_DECAY = 0.93;

const RETURN = 0.04;
const MAX_V = 6;

export function AmbientBackground({ enabled, color }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const particles: Particle[] = [];
    const rgb = hexToRgb(color);

    const mouse = { x: -10000, y: -10000 };
    const impulse = { x: 0, y: 0, life: 0 };
    let lastCursorKey = '';

    const sync = (): void => {
      const rect = canvas.getBoundingClientRect();
      const newW = rect.width;
      const newH = rect.height;
      if (newW <= 0 || newH <= 0) return;
      if (Math.abs(newW - w) < 1 && Math.abs(newH - h) < 1) return;

      const dpr = window.devicePixelRatio || 1;
      const oldW = w;
      const oldH = h;
      w = newW;
      h = newH;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        for (let i = 0; i < COUNT; i++) particles.push(create(w, h));
      } else if (oldW > 0 && oldH > 0) {
        for (const p of particles) {
          p.x = (p.x / oldW) * w;
          p.y = (p.y / oldH) * h;
        }
      } else {
        for (const p of particles) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
        }
      }
    };

    const onMove = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = (): void => {
      mouse.x = -10000;
      mouse.y = -10000;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    const pollCursor = (): void => {
      const ed = editorRef.get();
      if (!ed) return;
      const pos = ed.getPosition();
      if (!pos) return;
      const key = `${pos.lineNumber}:${pos.column}`;
      if (key === lastCursorKey) return;
      lastCursorKey = key;

      const visible = ed.getScrolledVisiblePosition(pos);
      if (!visible) return;
      const dom = ed.getDomNode();
      if (!dom) return;
      const er = dom.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      impulse.x = er.left - cr.left + visible.left;
      impulse.y = er.top - cr.top + visible.top + visible.height / 2;
      impulse.life = 1;
    };

    sync();
    requestAnimationFrame(sync);
    setTimeout(sync, 50);

    let frame = 0;
    let raf = 0;
    const tick = (): void => {
      if (frame % SYNC_EVERY === 0) sync();
      pollCursor();
      frame++;

      if (w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
          p.vx += (p.vxNat - p.vx) * RETURN;
          p.vy += (p.vyNat - p.vy) * RETURN;

          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const md2 = mdx * mdx + mdy * mdy;
          if (md2 < MOUSE_R2 && md2 > 0.01) {
            const md = Math.sqrt(md2);
            const f = (1 - md / MOUSE_R) * MOUSE_FORCE;
            p.vx += (mdx / md) * f;
            p.vy += (mdy / md) * f;
          }

          if (impulse.life > 0.005) {
            const cdx = p.x - impulse.x;
            const cdy = p.y - impulse.y;
            const cd2 = cdx * cdx + cdy * cdy;
            if (cd2 < CURSOR_R2 && cd2 > 0.01) {
              const cd = Math.sqrt(cd2);
              const f = (1 - cd / CURSOR_R) * CURSOR_FORCE * impulse.life;
              p.vx += (cdx / cd) * f;
              p.vy += (cdy / cd) * f;
            }
          }

          if (p.vx > MAX_V) p.vx = MAX_V;
          else if (p.vx < -MAX_V) p.vx = -MAX_V;
          if (p.vy > MAX_V) p.vy = MAX_V;
          else if (p.vy < -MAX_V) p.vy = -MAX_V;

          p.x += p.vx + Math.sin((p.y + p.drift) * 0.008) * 0.2;
          p.y += p.vy;

          if (p.y > h + 8) {
            p.y = -8;
            p.x = Math.random() * w;
          } else if (p.y < -20) {
            p.y = h + 8;
            p.x = Math.random() * w;
          }
          if (p.x < -8) p.x = w + 8;
          else if (p.x > w + 8) p.x = -8;

          ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        impulse.life *= CURSOR_DECAY;
        if (impulse.life < 0.005) impulse.life = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, color]);

  if (!enabled) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function create(w: number, h: number): Particle {
  const vxNat = (Math.random() - 0.5) * 0.12;
  const vyNat = 0.08 + Math.random() * 0.35;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: vxNat,
    vy: vyNat,
    vxNat,
    vyNat,
    r: 0.3 + Math.random() * 1.2,
    alpha: 0.14 + Math.random() * 0.3,
    drift: Math.random() * 1000
  };
}

function hexToRgb(hex: string): string {
  const v = hex.replace('#', '');
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
