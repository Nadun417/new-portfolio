/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useFinePointer, useReducedMotionPref } from "@/lib/hooks";

/**
 * WebGL morph-reveal, ported from the "Lorenzo Interactive Portrait" technique
 * (a torn-paper / ink-bloom reveal). A ping-pong render target holds a reveal
 * field in its red channel: every frame the pointer *adds* an organic,
 * noise-distorted bloom and the whole field slowly *decays*. A second pass
 * samples that field and paints the reveal image only where it has soaked in,
 * so the built render bleeds fluidly through the blueprint beneath it.
 *
 * The blueprint itself is a plain <img> rendered underneath this (transparent)
 * canvas by the parent, so this component only paints the reveal. Three.js is
 * loaded lazily from CDN and only mounts on fine pointers with motion allowed.
 */

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

let threePromise: Promise<any> | null = null;
function loadThree(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if ((window as any).THREE) return Promise.resolve((window as any).THREE);
  if (!threePromise) {
    threePromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = THREE_SRC;
      s.async = true;
      s.onload = () => resolve((window as any).THREE);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return threePromise;
}

const BLOB_VS = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const BLOB_FS = `
  uniform float time, dTime, aspect, pointerDown, pointerRadius, pointerDuration;
  uniform vec2 pointer;
  uniform sampler2D prevFrame;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  void main(){
    float rVal = texture2D(prevFrame, vUv).r;
    rVal -= clamp(dTime / pointerDuration, 0.0, 0.05);
    rVal = clamp(rVal, 0.0, 1.0);
    float f = 0.0;
    if (pointerDown > 0.5) {
      vec2 uv = (vUv - 0.5) * 2.0 * vec2(aspect, 1.0);
      vec2 mouse = pointer * vec2(aspect, 1.0);
      float dist = length(uv - mouse);
      // clean circular falloff (no organic edge noise)
      f = 1.0 - smoothstep(pointerRadius * 0.05, pointerRadius * 1.2, dist);
    }
    rVal += f * 0.25;
    rVal = clamp(rVal, 0.0, 1.0);
    gl_FragColor = vec4(vec3(rVal), 1.0);
  }
`;

const REVEAL_VS = `
  varying vec2 vUv;
  varying vec4 vPosProj;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPosProj = gl_Position;
  }
`;

const REVEAL_FS = `
  uniform sampler2D texBlob;
  uniform sampler2D map;
  uniform float softness;
  varying vec2 vUv;
  varying vec4 vPosProj;
  void main(){
    vec2 blobUV = ((vPosProj.xy / vPosProj.w) + 1.0) * 0.5;
    float r = texture2D(texBlob, blobUV).r;
    float m = smoothstep(0.02, 0.02 + softness, r);
    if (m <= 0.001) discard;
    vec4 c = texture2D(map, vUv);
    gl_FragColor = vec4(c.rgb, c.a * m);
  }
`;

export default function InteractivePortrait({
  revealUrl,
  /** reveal size (fraction of half-height, ~0.1–0.4) */
  blobRadius = 0.16,
  /** higher = the reveal lingers longer before receding */
  fade = 0.55,
  /** feather width at the reveal edge */
  softness = 0.16,
  className,
}: {
  revealUrl: string;
  blobRadius?: number;
  fade?: number;
  softness?: number;
  className?: string;
}) {
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine || reduced) return;
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    loadThree()
      .then((THREE) => {
        if (disposed || !THREE || !containerRef.current) return;
        cleanup = init(THREE, container);
      })
      .catch(() => {});

    function init(THREE: any, container: HTMLDivElement): (() => void) | null {
      let width = container.clientWidth;
      let height = container.clientHeight;
      if (!width || !height) {
        const id = window.setTimeout(() => {
          if (!disposed) cleanup = init(THREE, container);
        }, 60);
        return () => window.clearTimeout(id);
      }

      let renderer: any;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
      } catch {
        return null; // no WebGL, so the blueprint <img> simply stays whole
      }
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
      const el = renderer.domElement as HTMLCanvasElement;
      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.width = "100%";
      el.style.height = "100%";
      container.appendChild(el);

      const gu = { time: { value: 0 }, dTime: { value: 0 }, aspect: { value: width / height } };
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
      camera.position.z = 1;

      // ---- reveal field (ping-pong render targets) ----
      const mkRT = () =>
        new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
      let rtOutput = mkRT();
      let prevRT = mkRT();

      const blobU = {
        pointer: { value: new THREE.Vector2(10, 10) },
        pointerDown: { value: 1 },
        pointerRadius: { value: blobRadius },
        pointerDuration: { value: fade },
        prevFrame: { value: prevRT.texture },
        time: gu.time,
        dTime: gu.dTime,
        aspect: gu.aspect,
      };
      const blobMat = new THREE.ShaderMaterial({ uniforms: blobU, vertexShader: BLOB_VS, fragmentShader: BLOB_FS });
      const rtMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blobMat);
      const rtCamera = new THREE.Camera();

      const renderBlob = () => {
        renderer.setRenderTarget(rtOutput);
        renderer.render(rtMesh, rtCamera);
        renderer.setRenderTarget(null);
        const tmp = prevRT;
        prevRT = rtOutput;
        rtOutput = tmp;
        blobU.prevFrame.value = prevRT.texture;
      };

      // ---- reveal image, cover-fit, painted where the field has soaked ----
      const loader = new THREE.TextureLoader();
      const revealTex = loader.load(revealUrl, (tex: any) => {
        if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
        coverGeom();
      });
      const revealU = { texBlob: { value: prevRT.texture }, map: { value: revealTex }, softness: { value: softness } };
      const revealMat = new THREE.ShaderMaterial({
        uniforms: revealU,
        vertexShader: REVEAL_VS,
        fragmentShader: REVEAL_FS,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const revealMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), revealMat);
      scene.add(revealMesh);

      const coverGeom = () => {
        const img = revealTex.image;
        if (!img) return;
        const s = Math.max(width / img.width, height / img.height);
        revealMesh.geometry.dispose();
        revealMesh.geometry = new THREE.PlaneGeometry(img.width * s, img.height * s);
        revealMesh.position.set(0, 0, 0);
      };

      const clock = new THREE.Clock();
      let raf = 0;
      const loop = () => {
        const dt = clock.getDelta();
        gu.time.value += dt;
        gu.dTime.value = dt;
        revealU.texBlob.value = rtOutput.texture; // target about to be written this frame
        renderBlob();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      const startLoop = () => {
        if (!raf) {
          clock.getDelta(); // drop the paused gap so decay doesn't jump
          raf = requestAnimationFrame(loop);
        }
      };
      const stopLoop = () => {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
      // only render while the hero is on screen
      const io = new IntersectionObserver(
        (entries) => (entries[0]?.isIntersecting ? startLoop() : stopLoop()),
        { threshold: 0 }
      );
      io.observe(container);
      startLoop();

      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
          blobU.pointer.value.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
        } else {
          blobU.pointer.value.set(10, 10);
        }
      };
      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        width = w;
        height = h;
        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        gu.aspect.value = w / h;
        coverGeom();
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("resize", onResize);

      return () => {
        io.disconnect();
        stopLoop();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        if (el.parentNode === container) container.removeChild(el);
        rtMesh.geometry.dispose();
        blobMat.dispose();
        revealMesh.geometry.dispose();
        revealMat.dispose();
        revealTex.dispose();
        rtOutput.dispose();
        prevRT.dispose();
        renderer.dispose();
      };
    }

    return () => {
      disposed = true;
      cleanup?.();
      cleanup = null;
    };
  }, [fine, reduced, revealUrl, blobRadius, fade, softness]);

  return <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0 }} aria-hidden />;
}
