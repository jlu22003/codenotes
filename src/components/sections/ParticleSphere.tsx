"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ParticleSphereProps {
  count?: number;
  radius?: number;
  className?: string;
}

const ROTATION_RADIANS_PER_SECOND = (2 * Math.PI) / 90; // slow, ambient drift
const MAX_MOUSE_YAW = 0.5; // radians of extra tilt at the viewport edge
const MAX_MOUSE_PITCH = 0.3;

// Scroll-driven explosion: each particle flies outward along its own
// randomized direction vector — not just along its existing radial line from
// center — by an amount continuously tied to how fast the page is being
// scrolled right now, via the same damped spring used for the mouse follow.
// Faster scrolling = more displacement; slowing down eases it back smoothly.
// There's no fixed-duration "burst" to trigger — it just tracks scroll speed.
const EXPLOSION_DISTANCE_MIN = 0.6; // fraction of radius traveled at full displacement
const EXPLOSION_DISTANCE_MAX = 1.6;
const SCROLL_SPEED_FOR_FULL_EXPLOSION = 2500; // px/second mapped to displacement amount = 1
const EXPLOSION_SPRING_STIFFNESS = 40;
const EXPLOSION_SPRING_DAMPING = 8; // slightly under-critical, a little overshoot on release

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Damped-spring constants for the mouse follow — under-critical damping
// (damping < 2 * sqrt(stiffness), i.e. < ~11 here) is what produces motion
// past the target before it settles. The lower the damping relative to that
// critical value, the more decaying back-and-forth swings ("taper") play out
// before it comes to rest, instead of a single quick overshoot-and-return.
const SPRING_STIFFNESS = 30;
const SPRING_DAMPING = 4.5;

// One semi-implicit-Euler step of a damped harmonic oscillator toward `target`.
function stepSpring(
  current: number,
  velocity: number,
  target: number,
  dt: number,
  stiffness: number = SPRING_STIFFNESS,
  damping: number = SPRING_DAMPING
) {
  const acceleration = (target - current) * stiffness - velocity * damping;
  const nextVelocity = velocity + acceleration * dt;
  const nextCurrent = current + nextVelocity * dt;
  return [nextCurrent, nextVelocity] as const;
}

// Resolves a CSS custom property (which may be an oklch()/etc. value three.js
// can't parse directly) to the "rgb(r, g, b)" form THREE.Color understands,
// by letting the browser's own computed-style resolution do the conversion.
function resolveCssColor(varName: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const probe = document.createElement("div");
  probe.style.color = `var(${varName})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return resolved || fallback;
}

// A small soft circular dot, shared by every particle in one draw call, so
// points render as soft circles instead of hard squares.
function createDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

export default function ParticleSphere({
  count = 1400,
  radius = 2.4,
  className,
}: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Uniform-random points across a thin spherical shell — randomized, not
    // evenly spaced, per the ask.
    const basePositions = new Float32Array(count * 3);
    // Each particle's explosion direction is its own independent random unit
    // vector — unrelated to its position's own direction from center — so the
    // burst scatters particles at varying vectors instead of every particle
    // simply puffing straight outward along the line it already sits on.
    const explosionDirections = new Float32Array(count * 3);
    const explosionDistances = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.85 + Math.random() * 0.15);

      basePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      basePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      basePositions[i * 3 + 2] = r * Math.cos(phi);

      const dirTheta = Math.random() * Math.PI * 2;
      const dirPhi = Math.acos(2 * Math.random() - 1);
      explosionDirections[i * 3] = Math.sin(dirPhi) * Math.cos(dirTheta);
      explosionDirections[i * 3 + 1] = Math.sin(dirPhi) * Math.sin(dirTheta);
      explosionDirections[i * 3 + 2] = Math.cos(dirPhi);
      explosionDistances[i] = randomBetween(EXPLOSION_DISTANCE_MIN, EXPLOSION_DISTANCE_MAX) * radius;
    }

    const geometry = new THREE.BufferGeometry();
    // A separate, live copy — mutated during an explosion, reset to
    // basePositions when idle — so basePositions itself always stays the
    // untouched source of truth each frame's displacement is computed from.
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(basePositions), 3)
    );

    const dotTexture = createDotTexture();
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(resolveCssColor("--foreground", "#3a3a3a")),
      size: 0.045,
      map: dotTexture ?? undefined,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Target values come straight from the cursor; the tick loop springs
    // toward them each frame so the sphere trails smoothly — and slightly
    // overshoots past the target before settling — instead of snapping to
    // the pointer or easing straight into it.
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let mouseCurrentX = 0;
    let mouseCurrentY = 0;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      mouseTargetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseTargetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    let frameId: number;
    let lastTime = performance.now();
    let autoAngleY = 0;
    let autoAngleX = 0;
    let lastScrollY = window.scrollY;
    let explosionAmount = 0;
    let explosionVelocity = 0;
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const livePositions = positionAttribute.array as Float32Array;

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      const tick = (now: number) => {
        // Clamp dt so a throttled/backgrounded tab can't hand the spring a
        // huge timestep and make it blow up when the tab regains focus.
        const deltaSeconds = Math.min((now - lastTime) / 1000, 1 / 30);
        lastTime = now;

        autoAngleY += ROTATION_RADIANS_PER_SECOND * deltaSeconds;
        autoAngleX += ROTATION_RADIANS_PER_SECOND * 0.3 * deltaSeconds;

        [mouseCurrentX, mouseVelocityX] = stepSpring(
          mouseCurrentX,
          mouseVelocityX,
          mouseTargetX,
          deltaSeconds
        );
        [mouseCurrentY, mouseVelocityY] = stepSpring(
          mouseCurrentY,
          mouseVelocityY,
          mouseTargetY,
          deltaSeconds
        );

        // Read actual scroll speed straight from window.scrollY each frame —
        // no event listener or trigger needed, just a continuous target the
        // spring chases. Scrolling fast pushes the target near 1; slowing
        // down or stopping naturally lets it settle back to 0.
        const scrollDelta = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        const scrollSpeed = Math.abs(scrollDelta) / deltaSeconds;
        const explosionTarget = Math.min(
          scrollSpeed / SCROLL_SPEED_FOR_FULL_EXPLOSION,
          1
        );
        [explosionAmount, explosionVelocity] = stepSpring(
          explosionAmount,
          explosionVelocity,
          explosionTarget,
          deltaSeconds,
          EXPLOSION_SPRING_STIFFNESS,
          EXPLOSION_SPRING_DAMPING
        );

        if (explosionAmount > 0.001 || explosionTarget > 0) {
          for (let i = 0; i < count; i++) {
            const travel = explosionDistances[i] * explosionAmount;
            livePositions[i * 3] = basePositions[i * 3] + explosionDirections[i * 3] * travel;
            livePositions[i * 3 + 1] = basePositions[i * 3 + 1] + explosionDirections[i * 3 + 1] * travel;
            livePositions[i * 3 + 2] = basePositions[i * 3 + 2] + explosionDirections[i * 3 + 2] * travel;
          }
          positionAttribute.needsUpdate = true;
        }

        points.rotation.y = autoAngleY + mouseCurrentX * MAX_MOUSE_YAW;
        points.rotation.x = autoAngleX + mouseCurrentY * MAX_MOUSE_PITCH;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      dotTexture?.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [count, radius]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className ?? "h-full w-full"}
    />
  );
}
