// Animated "cloud network" background: drifting nodes that link up when
// close, and reach toward the pointer. Pauses off-screen and in hidden tabs;
// draws a single still frame when the user prefers reduced motion.

import { prefersReducedMotion } from "../core/dom";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hot: boolean; // orange "active" node
}

export function networkCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = "network-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  let nodes: Node[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let visible = true;
  const pointer = { x: -9999, y: -9999 };
  const LINK = 140;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(28, (width * height) / 14000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 1,
      hot: Math.random() < 0.12,
    }));
    if (!running) draw();
  }

  function draw(): void {
    ctx!.clearRect(0, 0, width, height);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          const alpha = (1 - d / LINK) * 0.45;
          ctx!.strokeStyle = a.hot || b.hot ? `rgba(249,115,22,${alpha})` : `rgba(167,139,250,${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
      const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (dp < LINK * 1.4) {
        ctx!.strokeStyle = `rgba(253,186,116,${(1 - dp / (LINK * 1.4)) * 0.7})`;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(pointer.x, pointer.y);
        ctx!.stroke();
      }
    }
    for (const n of nodes) {
      ctx!.fillStyle = n.hot ? "#fb923c" : "rgba(221,214,254,0.9)";
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, n.hot ? n.r + 1 : n.r, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  function step(): void {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;
    }
    draw();
    frame = requestAnimationFrame(step);
  }

  function start(): void {
    if (running || prefersReducedMotion() || !visible || document.hidden) return;
    running = true;
    frame = requestAnimationFrame(step);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(frame);
  }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  }).observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  const host = () => canvas.parentElement ?? canvas;
  queueMicrotask(() => {
    host().addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    host().addEventListener("pointerleave", () => {
      pointer.x = pointer.y = -9999;
    });
  });

  start();
  return canvas;
}
