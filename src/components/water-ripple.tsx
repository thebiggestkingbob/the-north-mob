"use client";

import { useEffect, useRef } from "react";

const vertexSource = `
attribute vec2 point;
varying vec2 uv;
void main(){ uv=(point+1.0)*0.5; gl_Position=vec4(point,0.0,1.0); }
`;
const fragmentSource = `
precision mediump float;
uniform sampler2D photo;
uniform vec2 crop;
uniform vec2 offset;
uniform float aspect;
uniform float time;
uniform vec4 drops[4];
varying vec2 uv;
void main(){
  vec2 shift=vec2(0.0);
  for(int i=0;i<4;i++){
    float age=time-drops[i].z;
    vec2 delta=(uv-drops[i].xy)*vec2(aspect,1.0);
    float distance=length(delta);
    float band=distance-age*0.34;
    float alive=step(0.0,age)*(1.0-smoothstep(2.5,3.8,age));
    float wave=sin(band*76.0)*exp(-band*band/0.012)*alive*drops[i].w;
    shift+=normalize(delta+vec2(0.0001))*wave*0.016/vec2(aspect,1.0);
  }
  vec2 sampleUV=(uv+shift)*crop+offset;
  vec4 color=texture2D(photo,clamp(sampleUV,0.001,0.999));
  float inside=step(0.0,sampleUV.x)*step(sampleUV.x,1.0)*step(0.0,sampleUV.y)*step(sampleUV.y,1.0);
  gl_FragColor=vec4(mix(vec3(0.0314,0.0353,0.0353),color.rgb,color.a*inside),1.0);
}
`;

// The original image remains the accessible, no-WebGL/reduced-motion fallback.
export function WaterRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.parentElement;
    const image = surface?.querySelector("img");
    const hero = surface?.closest<HTMLElement>(".home-hero");
    if (!canvas || !surface || !image || !hero) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const start = async () => {
      cleanup?.(); cleanup = undefined;
      if (reduced.matches || cancelled) return;
      try { await image.decode(); } catch { return; }
      if (cancelled || reduced.matches) return;
      const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power", preserveDrawingBuffer: false });
      if (!gl) return;
      const shaders: WebGLShader[] = [];
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("No shader");
        shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader unavailable");
        return shader;
      };
      const program = gl.createProgram();
      const buffer = gl.createBuffer();
      const texture = gl.createTexture();
      if (!program || !buffer || !texture) return;
      let frame = 0;
      let visible = true;
      let lastFrame = 0;
      let lastDrop = 0;
      let latestDrop = 0;
      let slot = 0;
      const drops = new Float32Array(16);
      for (let i = 0; i < 4; i++) drops[i * 4 + 2] = -100;
      let observer: ResizeObserver | undefined;
      let intersection: IntersectionObserver | undefined;
      const release = () => {
        cancelAnimationFrame(frame); frame = 0;
        delete canvas.dataset.ready;
        observer?.disconnect(); intersection?.disconnect();
        hero.removeEventListener("pointermove", move);
        hero.removeEventListener("pointerdown", down);
        document.removeEventListener("visibilitychange", visibility);
        canvas.removeEventListener("webglcontextlost", lost);
        shaders.forEach(shader => gl.deleteShader(shader));
        gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
      };
      function render(now: number) {
        frame = 0;
        if (!visible || document.hidden) return;
        if (now - lastFrame >= 30) {
          lastFrame = now;
          gl!.uniform1f(gl!.getUniformLocation(program!, "time"), now / 1000);
          gl!.uniform4fv(gl!.getUniformLocation(program!, "drops"), drops);
          gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
          canvas!.dataset.ready = "true";
        }
        if (now / 1000 - latestDrop < 4) frame = requestAnimationFrame(render);
        else delete canvas!.dataset.ready;
      }
      const wake = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render); };
      const addDrop = (x: number, y: number, strength: number) => {
        const now = performance.now() / 1000;
        drops.set([x, y, now, strength], slot * 4); slot = (slot + 1) % 4;
        latestDrop = now; wake();
      };
      const pointer = (event: PointerEvent, force = false) => {
        if ((event.target as HTMLElement).closest("a,button,input")) return;
        if (!force && (event.pointerType === "touch" || event.timeStamp - lastDrop < 180)) return;
        lastDrop = event.timeStamp;
        const bounds = canvas.getBoundingClientRect();
        addDrop((event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height, force ? 1 : .65);
      };
      function move(event: PointerEvent) { pointer(event); }
      function down(event: PointerEvent) { pointer(event, true); }
      function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); }
      function lost(event: Event) { event.preventDefault(); release(); }
      try {
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program unavailable");
        gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        const location = gl.getAttribLocation(program, "point");
        gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        const resize = () => {
          const width = surface.clientWidth, height = surface.clientHeight;
          const ratio = Math.min(devicePixelRatio || 1, 1.5, 1600 / width);
          canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
          gl.viewport(0, 0, canvas.width, canvas.height);
          const fit = (getComputedStyle(image).objectFit === "contain" ? Math.min : Math.max)(width / image.naturalWidth, height / image.naturalHeight);
          const cropX = width / (image.naturalWidth * fit), cropY = height / (image.naturalHeight * fit);
          const position = getComputedStyle(image).objectPosition.split(" ").map(value => parseFloat(value) / 100);
          gl.uniform2f(gl.getUniformLocation(program, "crop"), cropX, cropY);
          gl.uniform2f(gl.getUniformLocation(program, "offset"), (1 - cropX) * position[0], (1 - cropY) * (1 - position[1]));
          gl.uniform1f(gl.getUniformLocation(program, "aspect"), width / height);
          latestDrop = performance.now() / 1000; wake();
        };
        observer = new ResizeObserver(resize); observer.observe(surface); resize();
        intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } });
        intersection.observe(hero);
        hero.addEventListener("pointermove", move, { passive: true });
        hero.addEventListener("pointerdown", down, { passive: true });
        document.addEventListener("visibilitychange", visibility);
        canvas.addEventListener("webglcontextlost", lost);
        // One arrival ripple; subsequent ripples follow pointer/touch input.
        addDrop(.55, .55, 1);
        cleanup = release;
      } catch { release(); }
    };
    const change = () => { void start(); };
    reduced.addEventListener("change", change); void start();
    return () => { cancelled = true; reduced.removeEventListener("change", change); cleanup?.(); };
  }, []);
  return <canvas ref={canvasRef} className="water-ripple" aria-hidden="true" />;
}
